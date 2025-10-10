const express = require('express');
const router = express.Router();
const copilotService = require('../services/copilotService');

/**
 * @route GET /api/services
 * @desc 获取所有可用的AI服务列表
 */
router.get('/', async (req, res) => {
  try {
    const services = [
      {
        name: 'Wingman Service',
        endpoint: '/api/wingman',
        description: 'OCBC Wingman聊天服务',
        type: 'ai',
        enabled: true,
        status: 'active',
        priority: 1
      },
      {
        name: 'QA Service',
        endpoint: '/api/qa',
        description: '基于文档的问答服务',
        type: 'rag',
        enabled: true,
        status: 'active',
        priority: 2
      },
      {
        name: 'Copilot Service',
        endpoint: '/api/copilot',
        description: 'Microsoft Copilot集成服务',
        type: 'ai',
        enabled: copilotService.enabled,
        status: copilotService.enabled ? 'active' : 'disabled',
        priority: 3
      }
    ];

    res.json({
      success: true,
      data: services
    });

  } catch (error) {
    console.error('Services list error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * @route GET /api/services/:name/status
 * @desc 获取特定服务的详细状态
 */
router.get('/:name/status', async (req, res) => {
  try {
    const { name } = req.params;

    let status;
    switch (name.toLowerCase()) {
      case 'copilot':
        status = {
          enabled: copilotService.enabled,
          status: copilotService.enabled ? 'active' : 'disabled',
          capabilities: {
            chat_completion: true,
            document_summarization: true,
            code_generation: true
          }
        };
        break;
      
      case 'wingman':
        status = {
          enabled: true,
          status: 'active',
          capabilities: {
            chat_completion: true
          }
        };
        break;
      
      case 'qa':
        status = {
          enabled: true,
          status: 'active',
          capabilities: {
            document_based_qa: true,
            context_aware: true
          }
        };
        break;
      
      default:
        return res.status(404).json({
          error: `Service '${name}' not found`
        });
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Service status error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;