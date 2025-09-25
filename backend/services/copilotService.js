const axios = require('axios');

class CopilotService {
  constructor() {
    this.apiKey = process.env.COPILOT_API_KEY;
    this.baseUrl = process.env.COPILOT_BASE_URL || 'https://api.copilot.microsoft.com/v1';
    this.enabled = !!this.apiKey;
    
    // 如果没有配置Copilot，使用现有的AI服务
    this.fallbackService = null;
    if (!this.enabled) {
      // 优先使用DeepSeek，其次使用OpenAI
      if (process.env.DEEPSEEK_API_KEY) {
        this.fallbackService = 'deepseek';
      } else if (process.env.OPENAI_API_KEY) {
        this.fallbackService = 'openai';
      }
    }
  }

  /**
   * 使用 Copilot 增强问答功能
   */
  async enhanceWithCopilot(question, context, conversationHistory = []) {
    if (!this.enabled) {
      // 如果没有配置Copilot，使用现有的AI服务作为回退
      return await this.fallbackToExistingAI(question, context, conversationHistory);
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的文档分析助手。基于提供的文档上下文回答问题。

上下文信息：
${context}

请基于以上上下文信息回答问题。如果上下文信息不足以回答问题，请说明原因。`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: question
        }
      ];

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'copilot-chat',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.3,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        answer: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };

    } catch (error) {
      console.error('Copilot API error:', error.response?.data || error.message);
      // 如果Copilot失败，回退到现有的AI服务
      return await this.fallbackToExistingAI(question, context, conversationHistory);
    }
  }

  /**
   * 回退到现有的AI服务
   */
  async fallbackToExistingAI(question, context, conversationHistory = []) {
    if (!this.fallbackService) {
      throw new Error('No AI service available. Please configure either COPILOT_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY.');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的文档分析助手。基于提供的文档上下文回答问题。

上下文信息：
${context}

请基于以上上下文信息回答问题。如果上下文信息不足以回答问题，请说明原因。`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: question
        }
      ];

      let apiUrl, apiKey, model;
      
      if (this.fallbackService === 'deepseek') {
        apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        apiKey = process.env.DEEPSEEK_API_KEY;
        model = 'deepseek-chat';
      } else {
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        apiKey = process.env.OPENAI_API_KEY;
        model = 'gpt-3.5-turbo';
      }

      const response = await axios.post(
        apiUrl,
        {
          model: model,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.3,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        answer: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: model,
        fallback: true,
        fallbackService: this.fallbackService
      };

    } catch (error) {
      console.error(`${this.fallbackService} API error:`, error.response?.data || error.message);
      throw new Error(`${this.fallbackService} service error: ${error.message}`);
    }
  }

  /**
   * 使用 Copilot 进行文档摘要
   */
  async summarizeWithCopilot(content, maxLength = 500) {
    if (!this.enabled) {
      throw new Error('Copilot service is not configured.');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'copilot-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的文档摘要助手。请为以下内容生成简洁的摘要。'
            },
            {
              role: 'user',
              content: `请为以下内容生成一个不超过${maxLength}字的摘要：\n\n${content}`
            }
          ],
          max_tokens: Math.min(maxLength * 2, 1000),
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;

    } catch (error) {
      console.error('Copilot summarization error:', error);
      throw new Error(`Summarization failed: ${error.message}`);
    }
  }

  /**
   * 使用 Copilot 进行代码生成
   */
  async generateCodeWithCopilot(description, language = 'javascript') {
    if (!this.enabled) {
      throw new Error('Copilot service is not configured.');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'copilot-code',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的代码生成助手。请根据描述生成高质量的代码。'
            },
            {
              role: 'user',
              content: `请用${language}语言实现以下功能：${description}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        code: response.data.choices[0].message.content,
        language: language,
        usage: response.data.usage
      };

    } catch (error) {
      console.error('Copilot code generation error:', error);
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  /**
   * 检查 Copilot 服务状态
   */
  async checkStatus() {
    if (!this.enabled) {
      return {
        enabled: false,
        status: 'disabled',
        message: 'Copilot API key not configured'
      };
    }

    try {
      // 简单的 API 调用测试
      await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        enabled: true,
        status: 'active',
        message: 'Copilot service is available'
      };

    } catch (error) {
      return {
        enabled: true,
        status: 'error',
        message: `Service error: ${error.message}`
      };
    }
  }

  /**
   * 获取服务能力信息
   */
  getCapabilities() {
    return {
      name: 'Microsoft Copilot',
      enabled: this.enabled,
      features: [
        'enhanced_qa',
        'document_summarization',
        'code_generation',
        'conversational_ai'
      ],
      models: ['copilot-chat', 'copilot-code']
    };
  }
}

module.exports = new CopilotService();