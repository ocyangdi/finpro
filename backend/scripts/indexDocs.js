const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // 加载环境变量
const { Document } = require('../models');
const documentProcessor = require('../services/documentProcessor');
const vectorStoreService = require('../services/vectorStoreService');
const { sequelize } = require('../config/database');
const { initPinecone } = require('../config/pinecone');

async function indexAllDocuments() {
  try {
    console.log('🚀 Starting document indexing process...');
    
    // Initialize Pinecone client
    console.log('🔧 Initializing Pinecone client...');
    await initPinecone();
    console.log('✅ Pinecone client initialized');
    
    const docsDir = path.join(__dirname, '../../docs');
    const files = await fs.readdir(docsDir);
    
    console.log(`📁 Found ${files.length} files in docs directory`);
    
    // Filter supported file types
    const supportedFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.pdf', '.docx', '.doc', '.txt'].includes(ext);
    });
    
    console.log(`📄 ${supportedFiles.length} supported files found`);
    
    // Create a test user for document ownership (user ID 1)
    const userId = 1;
    
    let indexedCount = 0;
    let errorCount = 0;
    
    for (const filename of supportedFiles) {
      try {
        console.log(`\n📋 Processing: ${filename}`);
        
        const filePath = path.join(docsDir, filename);
        const fileStats = await fs.stat(filePath);
        
        // Check if document already exists in database
        const existingDoc = await Document.findOne({
          where: { filename: filename }
        });
        
        if (existingDoc) {
          console.log(`📝 Document already exists, re-indexing: ${filename}`);
          // Delete existing document to force re-indexing
          await existingDoc.destroy();
        }
        
        // Process document content
        const fileBuffer = await fs.readFile(filePath);
        const originalName = filename;
        const fileType = path.extname(filename).toLowerCase().replace('.', '');
        
        // Create document record
        const document = await Document.create({
          title: path.parse(filename).name,
          filename: filename,
          originalName: originalName,
          fileType: fileType,
          fileSize: fileStats.size,
          filePath: filePath,
          uploadedBy: userId,
          processingStatus: 'processing'
        });
        
        console.log(`📝 Created document record: ${document.id}`);
        
        // Process document content
        const processed = await documentProcessor.processDocument(filePath, originalName);
        
        // Update document with processed content
        await document.update({
          content: processed.content,
          wordCount: processed.wordCount,
          characterCount: processed.characterCount,
          processingStatus: 'completed'
        });
        
        console.log(`✅ Processed content: ${processed.wordCount} words`);
        
        // Chunk text for vector storage
        const chunks = documentProcessor.chunkText(processed.content);
        console.log(`✂️  Created ${chunks.length} chunks`);
        
        try {
          // Store chunks in vector database
          await vectorStoreService.storeDocumentChunks(document.id, chunks, {
            title: document.title,
            filename: document.filename,
            fileType: document.fileType,
            uploadedBy: document.uploadedBy
          });
          
          // Mark document as indexed
          await document.update({
            isIndexed: true,
            chunkCount: chunks.length
          });
          
          console.log(`🔍 Vector store updated for: ${filename}`);
        } catch (vectorError) {
          console.warn(`⚠️  Vector storage failed (continuing without vector store): ${vectorError.message}`);
          
          // Mark document as processed but not indexed
          await document.update({
            isIndexed: false,
            chunkCount: chunks.length,
            processingStatus: 'completed'
          });
        }
        
        console.log(`🎉 Successfully indexed: ${filename}`);
        indexedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Indexing completed!`);
    console.log(`✅ Successfully indexed: ${indexedCount} documents`);
    console.log(`❌ Errors: ${errorCount} documents`);
    
    return {
      successful: indexedCount,
      failed: errorCount,
      total: indexedCount + errorCount
    };
    
  } catch (error) {
    console.error('❌ Fatal error in indexing process:', error);
  }
}

// Run if called directly
if (require.main === module) {
  indexAllDocuments();
}

module.exports = { indexAllDocuments };