const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const { Document } = require('../models');
const documentProcessor = require('../services/documentProcessor');
const vectorStoreService = require('../services/vectorStoreService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const docsPath = path.join(__dirname, '../../docs');
    
    try {
      // 确保两个目录都存在
      await fs.mkdir(uploadPath, { recursive: true });
      await fs.mkdir(docsPath, { recursive: true });
      
      // 文件同时保存到 uploads 和 docs 目录
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  }
});

// Upload single document
router.post('/', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const { title, description } = req.body;
    const uploadedBy = req.body.userId || 1; // For testing without auth (default user ID 1)

    // 同时复制文件到docs目录以便自动索引
    const docsPath = path.join(__dirname, '../../docs');
    const docsFilePath = path.join(docsPath, req.file.filename);
    
    try {
      await fs.copyFile(req.file.path, docsFilePath);
      console.log(`📁 File copied to docs directory: ${docsFilePath}`);
    } catch (copyError) {
      console.error('❌ Failed to copy file to docs directory:', copyError);
      // 继续处理，不中断上传
    }

    // Create document record
    const document = await Document.create({
      title: title || path.parse(req.file.originalname).name,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      filePath: req.file.path,
      uploadedBy,
      metadata: {
        description: description || '',
        mimeType: req.file.mimetype
      }
    });

    // Process document asynchronously
    processDocumentAsync(document.id);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        uploadedAt: document.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Failed to upload document',
      message: error.message
    });
  }
});

// Get upload status
router.get('/status/:documentId', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    res.json({
      status: document.status,
      processingStatus: document.processingStatus,
      isIndexed: document.isIndexed,
      wordCount: document.wordCount,
      characterCount: document.characterCount,
      chunkCount: document.chunkCount,
      uploadedAt: document.createdAt,
      processedAt: document.processedAt,
      error: document.processingError
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to get upload status'
    });
  }
});

// Async document processing function
async function processDocumentAsync(documentId) {
  try {
    const document = await Document.findByPk(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update status to processing
    await document.updateStatus('processing');

    // Process document content
    const processed = await documentProcessor.processDocument(
      document.filePath,
      document.originalName
    );

    // Update document with processed content
    document.content = processed.content;
    document.wordCount = processed.wordCount;
    document.characterCount = processed.characterCount;

    // Chunk text for vector storage
    const chunks = documentProcessor.chunkText(processed.content);
    document.chunkCount = chunks.length;

    // Store chunks in vector database
    await vectorStoreService.storeDocumentChunks(
      documentId,
      chunks,
      {
        title: document.title,
        filename: document.filename,
        fileType: document.fileType,
        uploadedAt: document.createdAt
      }
    );

    // Update status to completed and mark as indexed
    document.processingStatus = 'completed';
    document.isIndexed = true;
    document.processedAt = new Date();
    await document.save();

    console.log(`✅ Document processed successfully: ${document.title}`);

  } catch (error) {
    console.error('Document processing failed:', error);
    
    // Update document status to failed
    try {
      const document = await Document.findByPk(documentId);
      if (document) {
        await document.updateStatus('failed', error);
      }
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }
  }
}

module.exports = router;