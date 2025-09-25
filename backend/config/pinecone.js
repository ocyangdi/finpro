const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;

const initPinecone = async () => {
  try {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY is not defined in environment variables');
    }
    
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    console.log('✅ Pinecone client initialized successfully');
    
    // Ensure index exists
    const indexName = process.env.PINECONE_INDEX_NAME || 'rag-documents';
    const indexes = await pineconeClient.listIndexes();
    
    if (!indexes.indexes?.some(index => index.name === indexName)) {
      console.log(`Creating Pinecone index: ${indexName}`);
      await pineconeClient.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
    return pineconeClient;
  } catch (error) {
    console.error('❌ Pinecone initialization failed:', error.message);
    throw error;
  }
};

const getPineconeClient = () => {
  if (!pineconeClient) {
    throw new Error('Pinecone client not initialized. Call initPinecone() first.');
  }
  return pineconeClient;
};

module.exports = {
  initPinecone,
  getPineconeClient
};