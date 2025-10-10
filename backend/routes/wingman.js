const express = require('express');
const router = express.Router();
const wingmanService = require('../services/wingmanService');

/**
 * @route POST /api/wingman/chat
 * @desc 使用 Wingman 聊天服务
 */
router.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Missing required field: question'
      });
    }

    const result = await wingmanService.chatWithWingman(question);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Wingman chat error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;