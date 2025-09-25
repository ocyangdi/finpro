const axios = require('axios');

// 添加请求延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPI() {
  try {
    console.log('🔍 测试后端API连接...');
    
    // 测试健康检查接口
    console.log('1. 测试健康检查接口...');
    await delay(1000); // 添加1秒延迟
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ 健康检查:', healthResponse.data);
    
    // 测试能力查询接口
    console.log('2. 测试能力查询接口...');
    await delay(1000); // 添加1秒延迟
    const capabilitiesResponse = await axios.get('http://localhost:3001/api/qa/capabilities');
    console.log('✅ 能力查询:', capabilitiesResponse.data);
    
    // 测试问答接口
    console.log('3. 测试问答接口...');
    await delay(1000); // 添加1秒延迟
    const qaResponse = await axios.post('http://localhost:3001/api/qa/ask', {
      question: 'hi',
      documentIds: []
    });
    console.log('✅ 问答接口:', qaResponse.data);
    
  } catch (error) {
    console.log('❌ API测试失败:');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
      console.log('错误详情:', error.response);
    } else if (error.request) {
      console.log('请求错误:', error.request);
    } else {
      console.log('错误:', error.message);
    }
    console.log('完整错误:', error);
  }
}

testAPI();