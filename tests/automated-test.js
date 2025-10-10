const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3001/api';
const TEST_CASES = [
  // 基础问候测试
  { question: '你好', expectedIntent: 'greeting', minConfidence: 0.9, description: '中文问候测试' },
  { question: 'hello', expectedIntent: 'greeting', minConfidence: 0.9, description: '英文问候测试' },
  
  // 财务知识测试
  { question: '如何分析财务报表', expectedIntent: 'financial.analysis', minConfidence: 0.8, description: '财务报表分析指导' },
  { question: '什么是现金流量表', expectedIntent: 'cashflow.explanation', minConfidence: 0.85, description: '现金流量表解释' },
  { question: '解释一下利润表', expectedIntent: 'income.statement', minConfidence: 0.85, description: '利润表说明' },
  { question: '资产负债表的结构', expectedIntent: 'balance.sheet', minConfidence: 0.8, description: '资产负债表结构' },
  
  // 英文财务问题
  { question: 'How to analyze financial statements', expectedIntent: 'financial.analysis', minConfidence: 0.8, description: '英文财务报表分析' },
  { question: 'What is cash flow statement', expectedIntent: 'cashflow.explanation', minConfidence: 0.8, description: '英文现金流量表' },
  
  // 模糊问题测试
  { question: '财务比率', expectedIntent: 'financial.ratios', minConfidence: 0.7, description: '财务比率相关' },
  { question: '盈利能力分析', expectedIntent: 'profitability.analysis', minConfidence: 0.7, description: '盈利能力分析' }
];

// 测试函数
async function runAutomatedTest() {
  console.log('🚀 开始自动化测试问答框功能...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    
    try {
      console.log(`📝 测试 ${i + 1}/${TEST_CASES.length}: ${testCase.description}`);
      console.log(`  问题: "${testCase.question}"`);
      
      // 发送API请求
      const response = await axios.post(`${BASE_URL}/qa/ask`, {
        question: testCase.question,
        documentIds: [] // 不指定文档，测试NLP功能
      });
      
      const { answer, source, confidence, intent } = response.data;
      
      console.log(`  回答来源: ${source}`);
      console.log(`  识别意图: ${intent || '无'}`);
      console.log(`  置信度: ${confidence}`);
      console.log(`  回答长度: ${answer.length} 字符`);
      
      // 验证测试结果
      let testPassed = true;
      let failureReason = '';
      
      if (source !== 'nlp') {
        testPassed = false;
        failureReason = `回答来源应为'nlp'，但得到'${source}'`;
      } else if (intent !== testCase.expectedIntent) {
        testPassed = false;
        failureReason = `意图应为'${testCase.expectedIntent}'，但得到'${intent}'`;
      } else if (confidence < testCase.minConfidence) {
        testPassed = false;
        failureReason = `置信度应 >= ${testCase.minConfidence}，但得到 ${confidence}`;
      } else if (answer.length < 10) {
        testPassed = false;
        failureReason = `回答过短，仅 ${answer.length} 字符`;
      }
      
      if (testPassed) {
        console.log('  ✅ 测试通过！\n');
        passed++;
      } else {
        console.log(`  ❌ 测试失败: ${failureReason}\n`);
        failed++;
      }
      
      // 添加短暂延迟，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`  ❌ 测试异常: ${error.message}\n`);
      failed++;
    }
  }
  
  // 测试系统能力查询
  console.log('🔧 测试系统能力查询...');
  try {
    const capabilitiesResponse = await axios.get(`${BASE_URL}/qa/capabilities`);
    const capabilities = capabilitiesResponse.data;
    
    console.log('  ✅ 系统能力查询成功');
    console.log(`  支持文档类型: ${capabilities.supportedDocumentTypes.join(', ')}`);
    console.log(`  NLP意图数量: ${capabilities.nlpIntents.length}`);
    console.log(`  最大上下文长度: ${capabilities.maxContextLength}\n`);
    
  } catch (error) {
    console.log(`  ❌ 能力查询失败: ${error.message}\n`);
    failed++;
  }
  
  // 测试结果汇总
  console.log('='.repeat(50));
  console.log('📊 自动化测试结果汇总:');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  
  if (failed === 0) {
    console.log('🎉 所有测试用例通过！问答框功能正常！');
  } else {
    console.log('⚠️  部分测试用例失败，请检查系统状态。');
  }
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的Promise拒绝:', error);
  process.exit(1);
});

// 运行测试
runAutomatedTest().catch(error => {
  console.error('❌ 测试执行失败:', error.message);
  console.log('💡 请确保后端服务器正在运行: npm run dev (在backend目录)');
  process.exit(1);
});