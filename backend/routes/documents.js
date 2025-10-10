const express = require('express');
const Document = require('../models/Document');
const vectorStoreService = require('../services/vectorStoreService');

const router = express.Router();

// Get all documents with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filter by status if provided
    if (req.query.status) {
      switch (req.query.status) {
        case 'ready':
          filter.processingStatus = 'completed';
          filter.isIndexed = true;
          break;
        case 'processing':
          filter.processingStatus = 'processing';
          break;
        case 'error':
          filter.processingStatus = 'failed';
          break;
        default:
          filter.processingStatus = req.query.status;
      }
    }
    
    // Filter by file type if provided
    if (req.query.fileType) {
      filter.fileType = req.query.fileType;
    }
    
    // Filter by user if provided
    if (req.query.userId) {
      filter.uploadedBy = req.query.userId;
    }

    const documents = await Document.find(filter)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude content for list view

    const total = await Document.countDocuments(filter);

    res.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Failed to fetch documents'
    });
  }
});

// Get single document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    res.json(document);

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      error: 'Failed to fetch document'
    });
  }
});

// Get document content
router.get('/:id/content', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    if (document.processingStatus !== 'completed') {
      return res.status(400).json({
        error: 'Document not processed yet'
      });
    }

    res.json({
      content: document.content,
      metadata: {
        title: document.title,
        wordCount: document.wordCount,
        characterCount: document.characterCount,
        chunkCount: document.chunkCount
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      error: 'Failed to fetch document content'
    });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Delete from vector store first
    if (document.isIndexed) {
      await vectorStoreService.deleteDocumentChunks(req.params.id);
    }

    // Delete document record
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Document deleted successfully',
      deleted: true
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: 'Failed to delete document'
    });
  }
});

// Get document statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.query.userId;
    const stats = await Document.getStats(userId);

    res.json(stats);

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics'
    });
  }
});

// Search documents by title or content
router.get('/search/text', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Search query required'
      });
    }

    const skip = (page - 1) * limit;
    
    const documents = await Document.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ],
      processingStatus: 'completed'
    })
    .sort({ uploadedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content');

    const total = await Document.countDocuments({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ],
      processingStatus: 'completed'
    });

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Text search error:', error);
    res.status(500).json({
      error: 'Failed to search documents'
    });
  }
});

// Reprocess document
router.post('/:id/reprocess', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Reset processing status
    document.processingStatus = 'pending';
    document.isIndexed = false;
    document.processingError = '';
    await document.save();

    // Start async processing
    require('./upload').processDocumentAsync(document._id);

    res.json({
      message: 'Document reprocessing started',
      documentId: document._id
    });

  } catch (error) {
    console.error('Reprocess error:', error);
    res.status(500).json({
      error: 'Failed to reprocess document'
    });
  }
});

module.exports = router;