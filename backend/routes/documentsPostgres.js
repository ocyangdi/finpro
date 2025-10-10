const express = require('express');
const { Op } = require('sequelize');
const { Document } = require('../models');
const vectorStoreService = require('../services/vectorStoreService');

const router = express.Router();

// Get all documents with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Filter by status if provided
    if (req.query.status) {
      switch (req.query.status) {
        case 'ready':
          whereClause.processingStatus = 'completed';
          whereClause.isIndexed = true;
          break;
        case 'processing':
          whereClause.processingStatus = 'processing';
          break;
        case 'error':
          whereClause.processingStatus = 'failed';
          break;
        default:
          whereClause.processingStatus = req.query.status;
      }
    }
    
    // Filter by file type if provided
    if (req.query.fileType) {
      whereClause.fileType = req.query.fileType;
    }
    
    // Filter by user if provided
    if (req.query.userId) {
      whereClause.uploadedBy = req.query.userId;
    }

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      attributes: { exclude: ['content'] } // Exclude content for list view
    });

    res.json({
      documents,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
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
    const document = await Document.findByPk(req.params.id);
    
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
    const document = await Document.findByPk(req.params.id);
    
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
    const document = await Document.findByPk(req.params.id);
    
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
    await document.destroy();

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

    const offset = (page - 1) * limit;
    
    const { count, rows: documents } = await Document.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { content: { [Op.iLike]: `%${q}%` } }
        ],
        processingStatus: 'completed'
      },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      attributes: { exclude: ['content'] }
    });

    res.json({
      documents,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      error: 'Failed to search documents'
    });
  }
});

module.exports = router;