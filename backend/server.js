const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { initPinecone } = require('./config/pinecone');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (temporarily increased for testing)
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for API documentation
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documentsPostgres'));
app.use('/api/qa', require('./routes/qa'));
app.use('/api/upload', require('./routes/uploadPostgres'));
app.use('/api/indexing', require('./routes/indexing'));
app.use('/api/copilot', require('./routes/copilot'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'RAG Backend'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 启动服务器前连接数据库和初始化Pinecone
Promise.all([
  connectDB(),
  initPinecone()
]).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 RAG Backend Server running on port ${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
    
    // Start file watcher for automatic indexing after server is ready
    setTimeout(() => {
      const fileWatcherService = require('./services/fileWatcherService');
      fileWatcherService.startWatching();
    }, 3000); // Delay 3 seconds to ensure server is fully ready
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = app;