const { ChatOpenAI } = require('@langchain/openai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { NlpManager } = require('node-nlp');

class QAService {
  constructor() {
    this.llm = null;
    this.nlpManager = null;
    this.initializeLLM();
    this.initializeNLP();
  }

  async initializeNLP() {
    try {
      this.nlpManager = new NlpManager({ languages: ['zh', 'en'] });
      
      // 检查是否存在已保存的模型文件
      const fs = require('fs');
      const path = require('path');
      const modelPath = path.join(__dirname, '..', '..', 'model.nlp');
      
      if (fs.existsSync(modelPath)) {
        // 加载已保存的模型
        await this.nlpManager.load(modelPath);
        console.log('✅ Node-NLP对话模型已加载');
      } else {
        // 添加中文财务对话训练数据
        this.nlpManager.addNamedEntityText('financial_term', '财务报表', ['zh'], ['财务报表', '财务报告', '损益表', '资产负债表']);
        this.nlpManager.addNamedEntityText('financial_term', '现金流量', ['zh'], ['现金流量', '现金流', '现金流动']);
        this.nlpManager.addNamedEntityText('financial_term', '利润', ['zh'], ['利润', '净利润', '毛利润', '营业利润']);
        
        // 中文意图和回答
        this.nlpManager.addDocument('zh', '如何分析财务报表？', 'financial.analysis');
        this.nlpManager.addDocument('zh', '财务报表怎么看？', 'financial.analysis');
        this.nlpManager.addDocument('zh', '什么是现金流量表？', 'cashflow.explanation');
        this.nlpManager.addDocument('zh', '解释一下利润表', 'income.statement');
        this.nlpManager.addDocument('zh', '报销', 'reimbursement.definition');
        this.nlpManager.addDocument('zh', '报销是什么？', 'reimbursement.definition');
        this.nlpManager.addDocument('zh', '报销是什么', 'reimbursement.definition');
        this.nlpManager.addDocument('zh', '报销流程', 'reimbursement.process');
        this.nlpManager.addDocument('zh', '怎么报销？', 'reimbursement.process');
        this.nlpManager.addDocument('zh', '怎么报销', 'reimbursement.process');
        this.nlpManager.addDocument('zh', '如何报销？', 'reimbursement.process');
        this.nlpManager.addDocument('zh', '如何报销', 'reimbursement.process');
        this.nlpManager.addDocument('zh', '报销的基本流程', 'reimbursement.process');
        this.nlpManager.addDocument('zh', '你好', 'greeting');
        this.nlpManager.addDocument('zh', '您好', 'greeting');
        this.nlpManager.addDocument('zh', '嗨', 'greeting');
        
        this.nlpManager.addAnswer('zh', 'financial.analysis', '财务报表分析主要包括：1. 资产负债表分析（偿债能力）2. 利润表分析（盈利能力）3. 现金流量表分析（现金状况）。建议关注财务比率和趋势分析。');
        this.nlpManager.addAnswer('zh', 'cashflow.explanation', '现金流量表反映企业在一定期间内现金流入和流出的情况，分为经营活动、投资活动和筹资活动三个部分。');
        this.nlpManager.addAnswer('zh', 'income.statement', '利润表（损益表）显示企业在一定期间内的收入、成本和利润情况，包括营业收入、营业成本、营业利润、净利润等指标。');
        this.nlpManager.addAnswer('zh', 'reimbursement.definition', '报销是指员工因公发生的合理费用，按照公司规定向企业申请补偿的过程。报销需要提供原始发票、费用明细等证明材料。');
        this.nlpManager.addAnswer('zh', 'reimbursement.process', '报销基本流程：1. 准备材料（发票、收据等）2. 填写报销单3. 部门主管审批4. 财务部门审核5. 财务处理打款。一般3-7个工作日内完成。');
        this.nlpManager.addAnswer('zh', 'greeting', '您好！我是财务文档助手，可以帮您分析财务报表和回答财务相关问题。请上传文档或直接提问。');
        
        // 英文意图和回答
        this.nlpManager.addDocument('en', 'how to analyze financial statements?', 'financial.analysis');
        this.nlpManager.addDocument('en', 'what is cash flow statement?', 'cashflow.explanation');
        this.nlpManager.addDocument('en', 'explain income statement', 'income.statement');
        this.nlpManager.addDocument('en', 'hello', 'greeting');
        this.nlpManager.addDocument('en', 'hi', 'greeting');
        
        this.nlpManager.addAnswer('en', 'financial.analysis', 'Financial statement analysis includes: 1. Balance sheet analysis (liquidity) 2. Income statement analysis (profitability) 3. Cash flow statement analysis (cash position). Focus on financial ratios and trend analysis.');
        this.nlpManager.addAnswer('en', 'cashflow.explanation', 'The cash flow statement shows the inflow and outflow of cash during a period, divided into operating, investing, and financing activities.');
        this.nlpManager.addAnswer('en', 'income.statement', 'The income statement shows a company\'s revenues, costs, and profits over a period, including revenue, cost of goods sold, operating profit, net income, etc.');
        this.nlpManager.addAnswer('en', 'greeting', 'Hello! I am a financial document assistant. I can help you analyze financial statements and answer financial questions. Please upload documents or ask questions directly.');
        
        // 训练NLP模型
        await this.nlpManager.train();
        this.nlpManager.save(modelPath);
        console.log('✅ Node-NLP对话模型训练完成并保存');
      }
      
    } catch (error) {
      console.error('❌ Node-NLP初始化失败:', error.message);
      this.nlpManager = null;
    }
  }

  initializeLLM() {
    try {
      // Prefer DeepSeek if available, then OpenAI, then Google AI
      if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'sk-1234567890abcdef1234567890abcdef1234567890abcdef') {
        // Using OpenAI-compatible endpoint for DeepSeek
        this.llm = new ChatOpenAI({
          openAIApiKey: process.env.DEEPSEEK_API_KEY,
          modelName: 'deepseek-chat',
          temperature: 0.1,
          maxTokens: 1000,
          configuration: {
            baseURL: 'https://api.deepseek.com/v1'
          }
        });
        console.log('✅ Using DeepSeek for QA');
      } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
        this.llm = new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'gpt-3.5-turbo',
          temperature: 0.1,
          maxTokens: 1000
        });
        console.log('✅ Using OpenAI GPT for QA');
      } else if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your-google-ai-api-key-here') {
        this.llm = new ChatGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_AI_API_KEY,
          modelName: 'gemini-pro',
          temperature: 0.1,
          maxOutputTokens: 1000
        });
        console.log('✅ Using Google Gemini for QA');
      } else {
        console.log('⚠️  No LLM API key found. Using simple keyword matching for QA');
        this.useSimpleMatching = true;
      }
    } catch (error) {
      console.error('❌ LLM initialization failed:', error.message);
      console.log('⚠️  Falling back to simple keyword matching for QA');
      this.useSimpleMatching = true;
    }
  }

  // 新增：NLP对话处理方法
  async nlpConversation(question) {
    if (!this.nlpManager) {
      return null;
    }

    try {
      const response = await this.nlpManager.process(question);
      
      if (response.intent !== 'None' && response.score > 0.7) {
        return {
          answer: response.answer,
          intent: response.intent,
          confidence: response.score,
          source: 'nlp',
          entities: response.entities
        };
      }
      
      return null;
    } catch (error) {
      console.error('NLP对话处理失败:', error);
      return null;
    }
  }

  async generateAnswer(question, contextChunks, documentMetadata = {}) {
    if (this.useSimpleMatching) {
      // Simple keyword-based answer generation for development
      const questionLower = question.toLowerCase();
      let answer = "I found some relevant information in the documents:";
      
      contextChunks.forEach((chunk, index) => {
        answer += `\n\n[From chunk ${index + 1}]: ${chunk.text.substring(0, 150)}...`;
      });
      
      answer += "\n\nNote: This is a development preview. For better answers, please set up OpenAI or Google AI API keys.";
      
      return {
        answer: answer,
        contextUsed: contextChunks.length,
        timestamp: new Date().toISOString()
      };
    }

    if (!this.llm) {
      throw new Error('LLM service not initialized');
    }

    try {
      const context = contextChunks
        .map((chunk, index) => `[Context ${index + 1}] ${chunk.text}`)
        .join('\n\n');

      const systemPrompt = `You are an expert AI assistant that provides accurate answers based strictly on the provided context.

IMPORTANT INSTRUCTIONS:
1. Answer ONLY using the information from the provided context
2. If the context doesn't contain relevant information, say "I don't have enough information to answer this question based on the provided documents."
3. Do not make up information or use external knowledge
4. Be concise and factual
5. If asked about the document itself, use the metadata: ${JSON.stringify(documentMetadata)}
6. Cite which context chunks you used for your answer

Context from documents:
${context}`;

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(question)
      ];

      const response = await this.llm.invoke(messages);
      
      return {
        answer: response.content,
        contextUsed: contextChunks.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('QA generation failed:', error);
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
  }

  async answerQuestion(question, documentId = null) {
    // 首先尝试NLP对话
    const nlpResponse = await this.nlpConversation(question);
    if (nlpResponse) {
      return {
        answer: nlpResponse.answer,
        contextUsed: 0,
        confidence: nlpResponse.confidence,
        source: nlpResponse.source,
        intent: nlpResponse.intent,
        relevantChunks: []
      };
    }

    const vectorStoreService = require('./vectorStoreService');
    
    try {
      let relevantChunks = [];
      
      // Try to use vector store if available
      try {
        // Search for relevant chunks
        relevantChunks = await vectorStoreService.searchSimilarChunks(
          question, 
          documentId,
          5 // top 5 most relevant chunks
        );
      } catch (vectorError) {
        console.warn('⚠️  Vector store search failed, using fallback method:', vectorError.message);
        
        // Fallback: get some random chunks from the database
        const Document = require('../models/DocumentPostgres');
        const documents = await Document.findAll({
          where: { isIndexed: true },
          limit: 3
        });
        
        if (documents.length > 0) {
          relevantChunks = documents.map(doc => ({
            id: doc.id,
            text: `Document: ${doc.title}. Content preview available.`,
            score: 0.5
          }));
        }
      }

      if (relevantChunks.length === 0) {
        // 如果没有找到相关文档内容，使用通用回答
        return {
          answer: "我无法在文档中找到相关信息来回答这个问题。您可以尝试上传相关财务文档或询问更具体的财务问题。",
          contextUsed: 0,
          confidence: 0,
          relevantChunks: []
        };
      }

      // Get document metadata if available
      let documentMetadata = {};
      if (documentId) {
        const Document = require('../models/Document');
        const doc = await Document.findById(documentId);
        if (doc) {
          documentMetadata = {
            title: doc.title,
            filename: doc.filename,
            uploadedAt: doc.uploadedAt
          };
        }
      }

      // Generate answer using LLM
      const result = await this.generateAnswer(
        question, 
        relevantChunks, 
        documentMetadata
      );

      return {
        ...result,
        confidence: this.calculateConfidence(relevantChunks),
        relevantChunks: relevantChunks.map(chunk => ({
          id: chunk.id,
          score: chunk.score,
          text: chunk.text.substring(0, 200) + '...' // Preview
        }))
      };
    } catch (error) {
      console.error('Question answering failed:', error);
      
      // 优雅降级：根据错误类型提供不同的降级回答
      let fallbackAnswer = '';
      
      if (error.message.includes('LLM service not initialized')) {
        // AI服务未配置
        fallbackAnswer = `我注意到您的问题："${question}"。虽然AI服务暂时不可用，但我可以为您提供一些财务分析的基本指导：\n\n📊 **财务分析要点**\n• 盈利能力分析：关注毛利率、净利率等指标\n• 偿债能力分析：流动比率、速动比率、资产负债率\n• 运营效率：存货周转率、应收账款周转率\n• 现金流量分析：经营、投资、籌資活動现金流\n\n请配置AI服务密钥以获得更精准的回答。`;
      } else if (error.message.includes('Failed to generate answer')) {
        // AI生成失败
        fallbackAnswer = `关于"${question}"，虽然AI生成遇到了技术问题，但以下是一些通用的财务分析建议：\n\n💡 **分析建议**\n1. 首先理解问题的核心财务概念\n2. 查找相关财务文档中的具体数据\n3. 对比历史数据或行业标准\n4. 关注异常值和趋势变化\n\n您可以稍后重试或联系技术支持。`;
      } else if (error.message.includes('Vector store')) {
        // 向量数据库问题
        fallbackAnswer = `您的问题"${question}"需要文档分析支持。目前文档检索服务暂时不可用，但以下是一些财务文档分析的通用方法：\n\n🔍 **文档分析方法**\n• 识别文档中的关键财务表格和数据\n• 关注管理层讨论和分析部分\n• 查找审计意见和重要声明\n• 分析附注中的详细信息\n\n请稍后重试或上传相关文档。`;
      } else {
        // 其他未知错误
        fallbackAnswer = `关于"${question}"，系统遇到了技术问题。以下是一些财务分析的通用指导：\n\n📈 **财务分析框架**\n1. **横向分析**：对比同期不同项目\n2. **纵向分析**：对比不同期间同一项目\n3. **比率分析**：计算关键财务比率\n4. **趋势分析**：观察数据变化趋势\n\n请稍后重试或联系技术支持。`;
      }
      
      return {
        answer: fallbackAnswer,
        contextUsed: 0,
        confidence: 0.3,
        source: 'fallback',
        fallback: true,
        relevantChunks: []
      };
    }
  }

  calculateConfidence(chunks) {
    if (chunks.length === 0) return 0;
    
    // Calculate average score of top chunks
    const avgScore = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length;
    
    // Normalize to 0-1 scale and apply some scaling
    return Math.min(1, Math.max(0, avgScore * 1.5));
  }
}

module.exports = new QAService();