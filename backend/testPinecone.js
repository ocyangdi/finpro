const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function testPinecone() {
  try {
    console.log('🔍 Testing Pinecone connection...');
    console.log('API Key:', process.env.PINECONE_API_KEY ? '✅ Provided' : '❌ Missing');
    console.log('Environment:', process.env.PINECONE_ENVIRONMENT || 'Not set');
    
    if (!process.env.PINECONE_API_KEY) {
      console.log('❌ PINECONE_API_KEY is not defined');
      return;
    }
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    console.log('✅ Pinecone client created successfully');
    
    // Test listing indexes
    const indexes = await pinecone.listIndexes();
    console.log('📋 Available indexes:', indexes.indexes?.map(i => i.name) || []);
    
    console.log('✅ Pinecone connection test successful!');
    
  } catch (error) {
    console.error('❌ Pinecone test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPinecone();