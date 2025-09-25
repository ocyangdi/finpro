const QAService = require('./services/qaService');

async function testNLP() {
  console.log('🧪 测试Node-NLP集成...\n');
  
  // 等待NLP初始化完成
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const testQuestions = [
    '你好',
    '如何分析财务报表？',
    '什么是现金流量表？',
    '解释一下利润表',
    '这个文档讲了什么？',
    'hello',
    'how to analyze financial statements?'
  ];
  
  for (const question of testQuestions) {
    console.log(`❓ 问题: "${question}"`);
    
    try {
      const response = await QAService.answerQuestion(question);
      
      console.log(`✅ 回答来源: ${response.source || 'document'}`);
      console.log(`📊 置信度: ${response.confidence}`);
      if (response.intent) {
        console.log(`🎯 识别意图: ${response.intent}`);
      }
      console.log(`💬 回答: ${response.answer.substring(0, 150)}...`);
      console.log('---'.repeat(20));
      
    } catch (error) {
      console.error(`❌ 错误: ${error.message}`);
      console.log('---'.repeat(20));
    }
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 测试能力查询
  const capabilities = await QAService.getCapabilities();
  console.log('🚀 系统能力:');
  console.log(JSON.stringify(capabilities, null, 2));
}

testNLP().catch(console.error);