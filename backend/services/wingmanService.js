const axios = require('axios');

class WingmanService {
  constructor() {
    this.baseUrl = 'https://ocbcwingman.ml-3ab7a488-2a6.apps.apps.prod7.ocbc.com/api/wingman/stream';
  }

  /**
   * 使用 Wingman 聊天服务
   */
  async chatWithWingman(question) {
    try {
      const requestBody = {
        inputs: question,
        prompt_type: 'chat'
      };

      const response = await axios.post(this.baseUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      });

      return {
        answer: response.data,
        service: 'wingman',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Wingman API error:', error.response?.data || error.message);
      throw new Error(`Wingman service error: ${error.message}`);
    }
  }
}

module.exports = new WingmanService();