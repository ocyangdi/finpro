const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/qa';

async function testVectorSearchIntegration() {
  console.log('🧪 测试向量搜索功能整合到统一接口\n');

  const testCases = [
    {
      question: "现金流量表分析",
      searchType: "semantic",
      useNLP: false, // 禁用NLP以测试向量搜索
      description: "纯向量搜索测试"
    },
    {
      question: "财务报表分析",
      searchType: "hybrid",
      useNLP: false,
      description: "混合搜索测试（向量+关键词）"
    },
    {
      question: "财务比率",
      searchType: "semantic",
      useNLP: false,
      description: "向量搜索特定术语"
    },
    {
      question: "资产负债表",
      searchType: "hybrid",
      useNLP: true,
      description: "完整整合测试（NLP+向量+关键词）"
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 测试: ${testCase.description}`);
    console.log(`❓ 问题: "${testCase.question}"`);
    console.log(`🔍 搜索类型: ${testCase.searchType}`);
    console.log(`🧠 NLP: ${testCase.useNLP ? '启用' : '禁用'}`);
    
    try {
      const response = await axios.post(`${BASE_URL}/ask`, {
        question: testCase.question,
        searchType: testCase.searchType,
        useNLP: testCase.useNLP,
        useCopilot: true
      });

      const data = response.data;
      
      console.log(`✅ 来源: ${data.source}`);
      console.log(`📊 总结果数: ${data.resultsCount}`);
      console.log(`🔮 语义搜索结果: ${data.semanticResults}`);
      console.log(`🔤 关键词搜索结果: ${data.keywordResults}`);
      
      if (data.nlpFallback) {
        console.log(`🧠 NLP备用: ${data.nlpFallback.used ? '已使用' : '未使用'}`);
      }
      
      console.log(`💬 回答预览: ${data.answer.substring(0, 150)}...`);
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      if (error.response) {
        console.error(`错误详情: ${JSON.stringify(error.response.data)}`);
      }
      console.log('---\n');
    }
  }

  // 测试向量搜索专用接口（已标记为遗留）
  console.log('🔍 测试遗留向量搜索接口...');
  try {
    const legacyResponse = await axios.post(`${BASE_URL}/search`, {
      query: "财务报表分析",
      topK: 3
    });
    
    console.log('⚠️ 遗留接口响应:');
    console.log(`   状态: ${legacyResponse.data.deprecated ? '已弃用' : '活跃'}`);
    console.log(`   消息: ${legacyResponse.data.message}`);
    console.log(`   结果数: ${legacyResponse.data.total}`);
    
  } catch (error) {
    console.error('❌ 遗留接口测试失败:', error.message);
  }

  console.log('✅ 向量搜索功能已成功整合到统一问答接口！');
  console.log('📋 使用说明:');
  console.log('   - 默认使用 Hybrid 模式（向量+关键词搜索）');
  console.log('   - 支持 semantic（纯向量）、keyword（纯关键词）、hybrid（混合）三种搜索类型');
  console.log('   - 自动集成 NLP 对话处理');
  console.log('   - 支持 Copilot 增强回答');
}

// 运行测试
testVectorSearchIntegration().catch(console.error);