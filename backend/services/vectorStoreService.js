const { getPineconeClient } = require('../config/pinecone');
const embeddingService = require('./embeddingService');

class VectorStoreService {
  constructor() {
    this.pinecone = null;
    this.indexName = process.env.PINECONE_INDEX_NAME || 'rag-documents';
    this.index = null;
  }

  async initialize() {
    try {
      this.pinecone = getPineconeClient();
      this.index = this.pinecone.Index(this.indexName);
      console.log('✅ Vector store service initialized');
    } catch (error) {
      console.error('❌ Vector store initialization failed:', error.message);
      throw error;
    }
  }

  async storeDocumentChunks(documentId, chunks, metadata = {}) {
    if (!this.index) {
      await this.initialize();
    }

    try {
      const texts = chunks.map(chunk => chunk.text);
      const embeddings = await embeddingService.generateEmbeddings(texts);
      
      const vectors = chunks.map((chunk, index) => ({
        id: `${documentId}_chunk_${index}`,
        values: embeddings[index],
        metadata: {
          ...metadata,
          documentId: documentId,
          chunkIndex: index,
          text: chunk.text,
          start: chunk.start,
          end: chunk.end,
          chunkSize: chunk.text.length
        }
      }));

      // Upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
      }

      console.log(`✅ Stored ${vectors.length} chunks for document ${documentId}`);
      return vectors.length;
    } catch (error) {
      console.error('Vector store operation failed:', error);
      throw new Error(`Failed to store document chunks: ${error.message}`);
    }
  }

  async searchSimilarChunks(query, documentId = null, topK = 5) {
    if (!this.index) {
      await this.initialize();
    }

    try {
      const queryEmbedding = await embeddingService.generateEmbeddings(query);
      
      let filter = {};
      if (documentId) {
        filter = { documentId: { '$eq': documentId } };
      }

      const results = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: filter
      });

      return results.matches.map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata.text,
        metadata: match.metadata
      }));
    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error(`Failed to search similar chunks: ${error.message}`);
    }
  }

  async deleteDocumentChunks(documentId) {
    if (!this.index) {
      await this.initialize();
    }

    try {
      await this.index.deleteMany({
        documentId: { '$eq': documentId }
      });
      
      console.log(`✅ Deleted chunks for document ${documentId}`);
      return true;
    } catch (error) {
      console.error('Delete operation failed:', error);
      throw new Error(`Failed to delete document chunks: ${error.message}`);
    }
  }

  async getDocumentStats(documentId) {
    if (!this.index) {
      await this.initialize();
    }

    try {
      // Get some sample chunks to estimate count
      const results = await this.index.query({
        vector: await embeddingService.generateEmbeddings('sample'),
        topK: 1,
        filter: { documentId: { '$eq': documentId } },
        includeMetadata: true
      });

      // This is an approximation since Pinecone doesn't provide exact count API
      return {
        chunkCount: 'estimated',
        hasChunks: results.matches.length > 0
      };
    } catch (error) {
      console.error('Stats retrieval failed:', error);
      return { error: error.message };
    }
  }
}

module.exports = new VectorStoreService();