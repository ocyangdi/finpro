const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/qa';

async function testUnifiedQA() {
  console.log('🧪 测试统一问答接口 (Hybrid模式 + Copilot + NLP)\n');

  const testCases = [
    {
      question: "什么是财务报表分析？",
      description: "测试NLP优先处理"
    },
    {
      question: "请分析一下现金流量表的重要性",
      description: "测试向量搜索 + Copilot"
    },
    {
      question: "报销流程是什么？",
      description: "测试NLP意图识别"
    },
    {
      question: "财务比率分析包括哪些内容？",
      description: "测试混合搜索模式"
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 测试: ${testCase.description}`);
    console.log(`❓ 问题: "${testCase.question}"`);
    
    try {
      const response = await axios.post(`${BASE_URL}/ask`, {
        question: testCase.question,
        // 使用默认参数：searchType="hybrid", useCopilot=true, useNLP=true
      });

      const data = response.data;
      
      console.log(`✅ 来源: ${data.source}`);
      console.log(`🔍 搜索类型: ${data.searchType}`);
      console.log(`📊 结果数量: ${data.resultsCount} (语义: ${data.semanticResults}, 关键词: ${data.keywordResults})`);
      
      if (data.nlpFallback) {
        console.log(`🧠 NLP备用: ${data.nlpFallback.used ? '已使用' : '未使用'} (置信度: ${data.nlpFallback.confidence})`);
      }
      
      console.log(`💬 回答预览: ${data.answer.substring(0, 100)}...`);
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      console.log('---\n');
    }
  }

  // 测试能力接口
  console.log('🔧 测试能力接口...');
  try {
    const capabilities = await axios.get(`${BASE_URL}/capabilities`);
    console.log('✅ 统一问答功能已启用:');
    console.log(`   - 支持搜索类型: ${capabilities.data.capabilities.vector_search.supportedTypes.join(', ')}`);
    console.log(`   - Copilot状态: ${capabilities.data.capabilities.copilot.enabled ? '已启用' : '未启用'}`);
    console.log(`   - NLP状态: ${capabilities.data.capabilities.nlp.enabled ? '已启用' : '未启用'}`);
    console.log(`   - 统一模式: ${capabilities.data.capabilities.unified_qa ? '已启用' : '未启用'}`);
  } catch (error) {
    console.error(`❌ 能力接口测试失败: ${error.message}`);
  }
}

// 运行测试
testUnifiedQA().catch(console.error);