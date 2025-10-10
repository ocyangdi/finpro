const axios = require('axios');

// 测试 Wingman 服务
async function testWingmanService() {
  console.log('🧪 测试 Wingman 聊天服务...\n');

  const baseUrl = 'http://localhost:3001';

  try {
    // 1. 测试聊天功能
    console.log('1. 测试聊天功能...');
    const chatResponse = await axios.post(`${baseUrl}/api/wingman/chat`, {
      question: '你好，请介绍一下你自己'
    });
    console.log('✅ 聊天响应:', chatResponse.data);

    console.log('\n🎉 Wingman 服务测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testWingmanService();