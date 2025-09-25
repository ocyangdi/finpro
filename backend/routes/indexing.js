const express = require('express');
const { indexAllDocuments } = require('../scripts/indexDocs');
const router = express.Router();

// Start document indexing
router.post('/index-docs', async (req, res) => {
  try {
    console.log('📦 Received request to index docs directory');
    
    // Run indexing in background
    indexAllDocuments()
      .then(result => {
        console.log('✅ Background indexing completed');
        console.log(`📊 Indexed ${result.successful} documents successfully`);
        if (result.failed > 0) {
          console.log(`⚠️  ${result.failed} documents failed to index`);
        }
      })
      .catch(error => console.error('❌ Background indexing failed:', error));
    
    res.json({
      message: 'Document indexing started in background',
      status: 'processing',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Indexing route error:', error);
    res.status(500).json({
      error: 'Failed to start indexing process',
      message: error.message
    });
  }
});

// Get indexing status
router.get('/indexing-status', async (req, res) => {
  try {
    // For now, return a simple status
    // In a real implementation, you'd track progress in database or cache
    res.json({
      status: 'idle',
      message: 'Indexing can be started via POST /api/indexing/index-docs'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get indexing status',
      message: error.message
    });
  }
});

module.exports = router;