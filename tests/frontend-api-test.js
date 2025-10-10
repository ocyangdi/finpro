// 前端API连接测试脚本
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testFrontendAPI() {
  console.log('🔍 测试前端API连接...\n');

  try {
    // 测试健康检查
    console.log('1. 测试健康检查接口...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ 健康检查成功:', healthResponse.data);
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
  }

  try {
    // 测试问答接口
    console.log('\n2. 测试问答接口...');
    const qaResponse = await axios.post(`${API_BASE_URL}/qa/ask`, {
      question: 'hi'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ 问答接口成功:', {
      answer: qaResponse.data.answer,
      confidence: qaResponse.data.confidence,
      source: qaResponse.data.source
    });
  } catch (error) {
    console.log('❌ 问答接口失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }

  try {
    // 测试文档列表接口
    console.log('\n3. 测试文档列表接口...');
    const docsResponse = await axios.get(`${API_BASE_URL}/documents`);
    console.log('✅ 文档列表成功:', {
      count: docsResponse.data.documents?.length || 0,
      status: 'OK'
    });
  } catch (error) {
    console.log('❌ 文档列表失败:', error.message);
  }

  console.log('\n📋 测试完成！');
}

testFrontendAPI().catch(console.error);