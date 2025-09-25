const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCopilotIntegration() {
  console.log('🧪 Testing Microsoft Copilot Integration...\n');

  try {
    // 1. 测试 Copilot 状态
    console.log('1. Testing Copilot status...');
    const statusResponse = await axios.get(`${API_BASE_URL}/copilot/status`);
    console.log('✅ Status:', statusResponse.data);
    
    // 2. 测试 Copilot 能力
    console.log('\n2. Testing Copilot capabilities...');
    const capabilitiesResponse = await axios.get(`${API_BASE_URL}/copilot/capabilities`);
    console.log('✅ Capabilities:', capabilitiesResponse.data);

    // 3. 测试增强问答（如果 Copilot 可用）
    if (statusResponse.data.enabled && statusResponse.data.status === 'active') {
      console.log('\n3. Testing enhanced QA with Copilot...');
      const qaResponse = await axios.post(`${API_BASE_URL}/copilot/enhance-qa`, {
        question: "什么是人工智能？",
        conversationHistory: []
      });
      console.log('✅ Enhanced QA response received');
      console.log('   Answer length:', qaResponse.data.answer?.length || 0);
      console.log('   Enhanced:', qaResponse.data.enhanced);
    } else {
      console.log('\n3. Copilot not available, testing fallback QA...');
      const qaResponse = await axios.post(`${API_BASE_URL}/copilot/enhance-qa`, {
        question: "什么是人工智能？",
        conversationHistory: []
      });
      console.log('✅ Fallback QA response received');
      console.log('   Fallback:', qaResponse.data.fallback);
      console.log('   Answer length:', qaResponse.data.answer?.length || 0);
    }

    // 4. 测试文档摘要
    console.log('\n4. Testing document summarization...');
    const summaryResponse = await axios.post(`${API_BASE_URL}/copilot/summarize`, {
      content: "人工智能是计算机科学的一个分支，旨在创造能够执行通常需要人类智能的任务的机器。这些任务包括学习、推理、问题解决、感知和语言理解。人工智能系统可以基于规则，也可以使用机器学习技术从数据中学习。",
      maxLength: 100
    });
    console.log('✅ Summary response received');
    console.log('   Original length:', summaryResponse.data.originalLength);
    console.log('   Summary length:', summaryResponse.data.summaryLength);

    // 5. 测试代码生成
    console.log('\n5. Testing code generation...');
    const codeResponse = await axios.post(`${API_BASE_URL}/copilot/generate-code`, {
      description: "创建一个函数来计算两个数字的和",
      language: "javascript"
    });
    console.log('✅ Code generation response received');
    console.log('   Code length:', codeResponse.data.code?.length || 0);
    console.log('   Language:', codeResponse.data.language);

    console.log('\n🎉 All Copilot integration tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('💡 Note: Copilot service might not be configured. Check your COPILOT_API_KEY environment variable.');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testCopilotIntegration();
}

module.exports = { testCopilotIntegration };