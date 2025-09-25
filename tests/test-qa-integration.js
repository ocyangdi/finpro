const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testQAIntegration() {
  console.log('🧪 测试问答框集成功能...\n');
  
  const testQuestions = [
    '你好',
    '如何分析财务报表？',
    '什么是现金流量表？',
    '解释一下利润表',
    'hello',
    'how to analyze financial statements?',
    '这个系统能做什么？'
  ];
  
  for (const question of testQuestions) {
    console.log(`❓ 发送问题: "${question}"`);
    
    try {
      const response = await axios.post(`${API_BASE}/qa/ask`, {
        question: question,
        documentId: null,
        topK: 3
      });
      
      const data = response.data;
      
      console.log(`✅ 回答来源: ${data.source || 'document'}`);
      console.log(`📊 置信度: ${data.confidence}`);
      if (data.intent) {
        console.log(`🎯 识别意图: ${data.intent}`);
      }
      console.log(`💬 回答: ${data.answer.substring(0, 100)}...`);
      console.log('---'.repeat(20));
      
    } catch (error) {
      console.error(`❌ 请求失败: ${error.response?.data?.message || error.message}`);
      console.log('---'.repeat(20));
    }
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 测试完成！现在您可以在浏览器中打开 http://localhost:3000 测试问答框功能');
}

// 检查服务器是否就绪
async function waitForServer() {
  console.log('⏳ 等待服务器就绪...');
  
  for (let i = 0; i < 10; i++) {
    try {
      await axios.get('http://localhost:3001/health');
      console.log('✅ 后端服务器已就绪');
      return true;
    } catch (error) {
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n❌ 服务器启动超时');
  return false;
}

async function main() {
  const isReady = await waitForServer();
  if (isReady) {
    await testQAIntegration();
  }
}

main().catch(console.error);