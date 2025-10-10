const { OpenAIEmbeddings } = require('@langchain/openai');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

class EmbeddingService {
  constructor() {
    this.embeddings = null;
    this.useDummyEmbeddings = false;
    this.initializeEmbeddings();
  }

  initializeEmbeddings() {
    try {
      // Prefer OpenAI if available, otherwise use Google AI
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
        this.embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'text-embedding-ada-002',
          dimensions: 1536
        });
        console.log('✅ Using OpenAI embeddings');
      } else if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'your-google-ai-api-key-here') {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GOOGLE_AI_API_KEY,
          modelName: 'embedding-001'
        });
        console.log('✅ Using Google AI embeddings');
      } else {
        console.log('⚠️  No embedding API key found. Using dummy embeddings for development');
        this.useDummyEmbeddings = true;
      }
    } catch (error) {
      console.error('❌ Embedding service initialization failed:', error.message);
      console.log('⚠️  Falling back to dummy embeddings for development');
      this.useDummyEmbeddings = true;
    }
  }

  async generateEmbeddings(texts) {
    if (this.useDummyEmbeddings) {
      // Generate simple dummy embeddings for development
      const generateDummyEmbedding = () => {
        const embedding = new Array(1536).fill(0);
        // Add some random variation
        for (let i = 0; i < 10; i++) {
          embedding[Math.floor(Math.random() * 1536)] = Math.random() * 0.1;
        }
        return embedding;
      };
      
      if (Array.isArray(texts)) {
        return texts.map(() => generateDummyEmbedding());
      } else {
        return generateDummyEmbedding();
      }
    }

    if (!this.embeddings) {
      throw new Error('Embedding service not initialized');
    }

    try {
      if (Array.isArray(texts)) {
        return await this.embeddings.embedDocuments(texts);
      } else {
        return await this.embeddings.embedQuery(texts);
      }
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  async getEmbeddingDimension() {
    // Test embedding to get dimension
    const testEmbedding = await this.generateEmbeddings('test');
    return testEmbedding.length;
  }
}

module.exports = new EmbeddingService();