const axios = require('axios');

// 添加请求延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function comprehensiveAPITest() {
  console.log('🔍 开始全面API有效性测试...\n');
  
  try {
    // 1. 测试健康检查接口
    console.log('1. 📊 测试健康检查接口...');
    await delay(500);
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ 健康检查成功:', {
      status: healthResponse.data.status,
      service: healthResponse.data.service,
      timestamp: healthResponse.data.timestamp
    });

    // 2. 测试能力查询接口
    console.log('\n2. 🛠️ 测试能力查询接口...');
    await delay(500);
    const capabilitiesResponse = await axios.get('http://localhost:3001/api/qa/capabilities');
    console.log('✅ 能力查询成功:', {
      支持多文档: capabilitiesResponse.data.capabilities.supportsMultipleDocuments,
      NLP支持: capabilitiesResponse.data.capabilities.hasNLP,
      支持格式: capabilitiesResponse.data.capabilities.supportedFormats.join(', ')
    });

    // 3. 测试问答接口 - 简单问候
    console.log('\n3. 💬 测试问答接口 - 简单问候...');
    await delay(500);
    const greetingResponse = await axios.post('http://localhost:3001/api/qa/ask', {
      question: '你好',
      documentIds: []
    });
    console.log('✅ 问候问答成功:', {
      回答长度: greetingResponse.data.answer.length,
      来源: greetingResponse.data.source,
      置信度: greetingResponse.data.confidence,
      意图: greetingResponse.data.intent
    });

    // 4. 测试问答接口 - 财务问题
    console.log('\n4. 💰 测试问答接口 - 财务问题...');
    await delay(500);
    const financeResponse = await axios.post('http://localhost:3001/api/qa/ask', {
      question: '如何分析财务报表',
      documentIds: []
    });
    console.log('✅ 财务问答成功:', {
      回答长度: financeResponse.data.answer.length,
      来源: financeResponse.data.source,
      置信度: financeResponse.data.confidence,
      意图: financeResponse.data.intent
    });

    // 5. 测试文档列表接口
    console.log('\n5. 📄 测试文档列表接口...');
    await delay(500);
    const documentsResponse = await axios.get('http://localhost:3001/api/documents');
    console.log('✅ 文档列表成功:', {
      文档数量: documentsResponse.data.documents.length,
      总文档数: documentsResponse.data.totalDocuments
    });

    // 6. 测试文档统计接口
    console.log('\n6. 📈 测试文档统计接口...');
    await delay(500);
    const statsResponse = await axios.get('http://localhost:3001/api/documents/stats/summary');
    console.log('✅ 文档统计成功:', {
      总文档: statsResponse.data.totalDocuments,
      就绪文档: statsResponse.data.readyDocuments,
      处理中: statsResponse.data.processingDocuments,
      失败文档: statsResponse.data.failedDocuments
    });

    console.log('\n🎉 所有API测试通过！系统完全正常运行！');
    console.log('📋 测试总结:');
    console.log('   - 健康检查: ✅');
    console.log('   - 能力查询: ✅');
    console.log('   - 问答功能: ✅ (NLP + 财务知识)');
    console.log('   - 文档管理: ✅');
    console.log('   - 系统统计: ✅');
    console.log('\n🚀 系统已准备好处理用户请求！');

  } catch (error) {
    console.log('\n❌ API测试失败:');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
      console.log('请求URL:', error.config?.url);
    } else if (error.request) {
      console.log('请求错误:', error.message);
    } else {
      console.log('错误:', error.message);
    }
    process.exit(1);
  }
}

// 运行测试
comprehensiveAPITest();