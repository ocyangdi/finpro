const express = require('express');
const copilotService = require('../services/copilotService');
const qaService = require('../services/qaService');

const router = express.Router();

// 使用 Copilot 增强问答
router.post('/enhance-qa', async (req, res) => {
  try {
    const { question, documentId, conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    // 首先使用 RAG 获取相关上下文
    let context = '';
    if (documentId) {
      const vectorStoreService = require('../services/vectorStoreService');
      const searchResults = await vectorStoreService.searchSimilarChunks(question, documentId, 5);
      context = searchResults.map(result => result.content).join('\n\n');
    }

    // 使用 Copilot 增强回答
    const copilotResult = await copilotService.enhanceWithCopilot(
      question, 
      context, 
      conversationHistory
    );

    res.json({
      question,
      answer: copilotResult.answer,
      enhanced: true,
      model: copilotResult.model,
      usage: copilotResult.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Copilot QA error:', error);
    
    // 如果 Copilot 失败，回退到标准 RAG
    if (error.message.includes('not configured') || error.message.includes('service error')) {
      try {
        const fallbackResult = await qaService.answerQuestion(question, documentId);
        
        res.json({
          question,
          ...fallbackResult,
          enhanced: false,
          fallback: true,
          message: 'Using standard RAG (Copilot not available)',
          timestamp: new Date().toISOString()
        });
      } catch (fallbackError) {
        console.error('Fallback QA also failed:', fallbackError);
        
        // 终极降级：提供优雅的通用回答
        const ultimateFallbackAnswer = `关于"${question}"，我们的AI服务暂时遇到了技术挑战。以下是一些财务分析的通用指导：\n\n🌟 **财务分析基本原则**\n• **全面性**：综合分析所有财务指标\n• **可比性**：与行业标准和历史数据对比\n• **及时性**：关注最新财务数据\n• **谨慎性**：保守评估风险和不确定性\n\n💡 **建议**\n1. 检查网络连接和系统状态\n2. 稍后重试\n3. 联系技术支持获取帮助\n\n我们正在努力恢复服务，感谢您的理解。`;
        
        res.json({
          question,
          answer: ultimateFallbackAnswer,
          enhanced: false,
          fallback: true,
          ultimateFallback: true,
          model: 'graceful-fallback',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(500).json({
        error: 'Copilot enhancement failed',
        message: error.message
      });
    }
  }
});

// 文档摘要
router.post('/summarize', async (req, res) => {
  try {
    const { content, maxLength = 500 } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Content is required'
      });
    }

    const summary = await copilotService.summarizeWithCopilot(content, maxLength);

    res.json({
      originalLength: content.length,
      summaryLength: summary.length,
      summary,
      model: 'copilot-chat',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Copilot summarization error:', error);
    res.status(500).json({
      error: 'Summarization failed',
      message: error.message
    });
  }
});

// 代码生成
router.post('/generate-code', async (req, res) => {
  try {
    const { description, language = 'javascript' } = req.body;

    if (!description) {
      return res.status(400).json({
        error: 'Description is required'
      });
    }

    const result = await copilotService.generateCodeWithCopilot(description, language);

    res.json({
      description,
      language,
      code: result.code,
      model: result.model,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Copilot code generation error:', error);
    res.status(500).json({
      error: 'Code generation failed',
      message: error.message
    });
  }
});

// 检查 Copilot 服务状态
router.get('/status', async (req, res) => {
  try {
    const status = await copilotService.checkStatus();
    
    res.json({
      ...status,
      capabilities: copilotService.getCapabilities(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Copilot status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

// 获取 Copilot 能力信息
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = copilotService.getCapabilities();
    
    res.json({
      ...capabilities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Copilot capabilities error:', error);
    res.status(500).json({
      error: 'Failed to get capabilities',
      message: error.message
    });
  }
});

module.exports = router;