const express = require('express');
const qaService = require('../services/qaService');
const copilotService = require('../services/copilotService');
const vectorStoreService = require('../services/vectorStoreService');
const { Document } = require('../models');

const router = express.Router();

// 统一问答接口 - 整合所有功能，默认使用Hybrid模式
router.post('/ask', async (req, res) => {
  try {
    const { 
      question, 
      documentId, 
      topK = 5,
      searchType = 'hybrid', // 默认使用hybrid模式
      useCopilot = true,     // 默认启用Copilot
      useNLP = true,         // 默认启用NLP
      conversationHistory = []
    } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    console.log(`🔍 Processing question: "${question}" with ${searchType} search`);

    // 1. 首先尝试NLP对话处理
    let nlpResult = null;
    if (useNLP) {
      nlpResult = await qaService.nlpConversation(question);
      if (nlpResult && nlpResult.confidence > 0.7) {
        console.log(`✅ NLP handled question with confidence: ${nlpResult.confidence}`);
        return res.json({
          question,
          answer: nlpResult.answer,
          source: 'nlp',
          confidence: nlpResult.confidence,
          intent: nlpResult.intent,
          entities: nlpResult.entities,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. 向量搜索获取相关文档片段
    let searchResults = [];
    try {
      if (searchType === 'semantic' || searchType === 'hybrid') {
        searchResults = await vectorStoreService.searchSimilarChunks(question, documentId, topK);
        console.log(`🔍 Found ${searchResults.length} semantic search results`);
      }
    } catch (error) {
      console.warn('Semantic search failed:', error.message);
    }

    // 3. 关键词搜索作为备用
    let keywordResults = [];
    if (searchType === 'keyword' || (searchType === 'hybrid' && searchResults.length === 0)) {
      try {
        const { Op } = require('sequelize');
        const documents = await Document.findAll({
          where: {
            [Op.or]: [
              { title: { [Op.iLike]: `%${question}%` } },
              { content: { [Op.iLike]: `%${question}%` } }
            ],
            processingStatus: 'completed'
          },
          limit: topK,
          attributes: ['id', 'title', 'content', 'filename']
        });

        keywordResults = documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          filename: doc.filename,
          text: doc.content.substring(0, 500) + '...',
          score: 0.8,
          source: 'keyword'
        }));
        console.log(`🔍 Found ${keywordResults.length} keyword search results`);
      } catch (error) {
        console.warn('Keyword search failed:', error.message);
      }
    }

    // 4. 合并搜索结果
    const allResults = [...searchResults, ...keywordResults];
    
    if (allResults.length === 0) {
      return res.json({
        question,
        answer: '抱歉，我没有找到与您的问题相关的文档内容。请尝试不同的关键词或上传相关文档。',
        source: 'no_results',
        suggestions: [
          '尝试使用更具体的关键词',
          '检查文档是否已正确上传和处理',
          '尝试不同的搜索类型'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // 5. 准备上下文
    const context = allResults
      .map((result, index) => `[来源 ${index + 1}: ${result.filename || result.title}] ${result.text}`)
      .join('\n\n');

    // 6. 使用AI生成答案
    let aiAnswer;
    try {
      if (useCopilot) {
        // 使用Copilot增强
        const copilotResult = await copilotService.enhanceWithCopilot(
          question, 
          context, 
          conversationHistory
        );
        aiAnswer = copilotResult.answer;
        console.log('✅ Answer generated with Copilot');
      } else {
        // 使用标准QA服务
        const qaResult = await qaService.answerQuestion(question, documentId, topK);
        aiAnswer = qaResult.answer;
        console.log('✅ Answer generated with standard QA');
      }
    } catch (error) {
      console.warn('AI generation failed, using fallback:', error.message);
      // 备用回答
      aiAnswer = `基于搜索到的${allResults.length}个相关文档片段，我为您整理了以下信息：\n\n` +
        allResults.map((result, index) => 
          `[${index + 1}] ${result.text.substring(0, 200)}...`
        ).join('\n\n');
    }

    // 7. 返回统一格式的响应
    res.json({
      question,
      answer: aiAnswer,
      source: useCopilot ? 'copilot' : 'qa',
      searchType,
      resultsCount: allResults.length,
      semanticResults: searchResults.length,
      keywordResults: keywordResults.length,
      nlpFallback: nlpResult ? {
        used: false,
        confidence: nlpResult.confidence,
        intent: nlpResult.intent
      } : null,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: new Date().toISOString(),
        searchStrategy: searchType,
        aiModel: useCopilot ? 'copilot' : 'standard',
        unifiedMode: true
      }
    });

  } catch (error) {
    console.error('Unified QA error:', error);
    res.status(500).json({
      error: 'Failed to process question',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 批量问答（保持原有功能）
router.post('/batch-ask', async (req, res) => {
  try {
    const { questions, documentId, topK = 3 } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'Questions array is required'
      });
    }

    if (questions.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 questions per batch'
      });
    }

    const results = await Promise.all(
      questions.map(async (question, index) => {
        try {
          const result = await qaService.answerQuestion(question, documentId, topK);
          return {
            question,
            ...result,
            success: true
          };
        } catch (error) {
          return {
            question,
            error: error.message,
            success: false
          };
        }
      })
    );

    res.json({
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch QA error:', error);
    res.status(500).json({
      error: 'Failed to process batch questions',
      message: error.message
    });
  }
});

// 语义搜索（保持原有功能，但标记为遗留接口）
router.post('/search', async (req, res) => {
  try {
    const { query, documentId, topK = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const results = await vectorStoreService.searchSimilarChunks(query, documentId, topK);

    res.json({
      query,
      results,
      total: results.length,
      timestamp: new Date().toISOString(),
      deprecated: true,
      message: 'This endpoint is deprecated. Please use /api/qa/ask with searchType parameter instead.'
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({
      error: 'Failed to perform semantic search',
      message: error.message
    });
  }
});

// 获取能力信息（增强版）
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = await qaService.getCapabilities();
    
    // 添加Copilot能力信息
    const copilotCapabilities = {
      enabled: copilotService.enabled,
      fallbackService: copilotService.fallbackService,
      features: ['enhanced_qa', 'summarization', 'code_generation']
    };

    // 添加向量搜索能力信息
    const vectorSearchCapabilities = {
      enabled: true, // 假设总是启用
      features: ['semantic_search', 'document_chunking', 'similarity_matching'],
      supportedTypes: ['semantic', 'keyword', 'hybrid']
    };

    res.json({
      capabilities: {
        ...capabilities,
        unified_qa: true,
        copilot: copilotCapabilities,
        vector_search: vectorSearchCapabilities,
        nlp: {
          enabled: true,
          languages: ['zh', 'en'],
          intents: ['financial.analysis', 'reimbursement.definition', 'greeting']
        }
      },
      available: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Capabilities error:', error);
    res.status(500).json({
      error: 'Failed to get capabilities',
      message: error.message,
      available: false
    });
  }
});

// 对话历史（保持原有功能）
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;
    
    // 占位符实现
    res.json({
      conversations: [],
      total: 0,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation history'
    });
  }
});

module.exports = router;