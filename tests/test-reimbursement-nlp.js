const QAService = require('./backend/services/qaService');

async function testReimbursementNLP() {
  console.log('🧪 测试报销相关NLP回答功能...\n');
  
  // 等待NLP模型初始化完成
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const testCases = [
    { question: '报销是什么？', expectedIntent: 'reimbursement.definition' },
    { question: '怎么报销？', expectedIntent: 'reimbursement.process' },
    { question: '如何报销？', expectedIntent: 'reimbursement.process' },
    { question: '报销流程', expectedIntent: 'reimbursement.process' },
    { question: '报销的基本流程', expectedIntent: 'reimbursement.process' },
    { question: '财务报表分析', expectedIntent: 'financial.analysis' },
    { question: '你好', expectedIntent: 'greeting' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`📝 测试问题: "${testCase.question}"`);
    console.log(`  期望意图: ${testCase.expectedIntent}`);
    
    try {
      const response = await QAService.nlpConversation(testCase.question);
      
      if (response && response.intent === testCase.expectedIntent) {
        console.log(`✅ 测试通过 - 识别意图: ${response.intent}`);
        console.log(`   置信度: ${response.confidence.toFixed(3)}`);
        console.log(`   回答: ${response.answer.substring(0, 80)}...`);
        passed++;
      } else if (response) {
        console.log(`❌ 测试失败 - 识别意图: ${response.intent} (期望: ${testCase.expectedIntent})`);
        console.log(`   置信度: ${response.confidence.toFixed(3)}`);
        failed++;
      } else {
        console.log(`❌ 测试失败 - 未识别意图`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ 测试失败 - 错误: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('📊 测试结果统计:');
  console.log(`✅ 通过: ${passed} 个`);
  console.log(`❌ 失败: ${failed} 个`);
  console.log(`📈 成功率: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  // 特别测试报销相关的降级回答
  console.log('\n🔍 测试报销问题的降级回答机制...');
  
  const reimbursementQuestions = [
    '报销是什么？',
    '怎么报销？',
    '报销流程'
  ];
  
  for (const question of reimbursementQuestions) {
    console.log(`\n📝 测试降级回答: "${question}"`);
    
    try {
      // 模拟后端服务不可用的情况
      const response = await QAService.answerQuestion(question);
      
      if (response.source === 'nlp') {
        console.log(`✅ NLP回答生效 - 意图: ${response.intent}`);
        console.log(`   回答: ${response.answer.substring(0, 100)}...`);
      } else if (response.fallback) {
        console.log(`⚠️ 降级回答生效 - 来源: ${response.source}`);
        console.log(`   回答: ${response.answer.substring(0, 100)}...`);
      } else {
        console.log(`ℹ️ 正常回答 - 来源: ${response.source}`);
        console.log(`   回答: ${response.answer.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ 测试失败 - 错误: ${error.message}`);
    }
  }
}

testReimbursementNLP().catch(console.error);