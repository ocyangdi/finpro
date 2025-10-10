const QAService = require('./backend/services/qaService');

async function testSingleWord() {
  console.log('🧪 测试单字报销问题的NLP回答...\n');
  
  const testCases = [
    '报销',
    '报销是什么',
    '报销是什么？',
    '怎么报销',
    '怎么报销？',
    '报销流程'
  ];
  
  for (const question of testCases) {
    console.log(`📝 测试问题: "${question}"`);
    
    try {
      const response = await QAService.nlpConversation(question);
      
      if (response) {
        console.log('✅ NLP回答生效');
        console.log(`   意图: ${response.intent}`);
        console.log(`   置信度: ${response.confidence.toFixed(3)}`);
        console.log(`   回答: ${response.answer}`);
      } else {
        console.log('❌ 未识别意图');
        
        // 测试完整的answerQuestion方法
        const fullResponse = await QAService.answerQuestion(question);
        console.log(`   完整回答来源: ${fullResponse.source}`);
        console.log(`   回答: ${fullResponse.answer.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
    }
    
    console.log('');
  }
}

testSingleWord().catch(console.error);