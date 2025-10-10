const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { indexAllDocuments } = require('../scripts/indexDocs');

class FileWatcherService {
  constructor() {
    this.watcher = null;
    this.watchPath = path.join(__dirname, '../../docs');
    this.isWatching = false;
  }

  async startWatching() {
    if (this.isWatching) {
      console.log('📁 File watcher is already running');
      return;
    }

    try {
      // Ensure docs directory exists
      if (!fs.existsSync(this.watchPath)) {
        console.log(`📁 Creating docs directory: ${this.watchPath}`);
        fs.mkdirSync(this.watchPath, { recursive: true });
      }

      this.watcher = chokidar.watch(this.watchPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true, // don't trigger for existing files on startup
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100
        }
      });

      // Event handlers
      this.watcher
        .on('add', (filePath) => this.onFileAdded(filePath))
        .on('change', (filePath) => this.onFileChanged(filePath))
        .on('unlink', (filePath) => this.onFileRemoved(filePath))
        .on('error', (error) => this.onError(error))
        .on('ready', () => this.onReady());

      this.isWatching = true;
      console.log(`👀 Watching for file changes in: ${this.watchPath}`);
      
    } catch (error) {
      console.error('❌ Failed to start file watcher:', error.message);
    }
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.isWatching = false;
      console.log('👋 Stopped file watcher');
    }
  }

  async onFileAdded(filePath) {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    // Only process supported file types
    const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    if (!supportedExtensions.includes(ext)) {
      return;
    }

    console.log(`📥 New file detected: ${filename}`);
    
    // Wait a moment to ensure file is fully written
    setTimeout(async () => {
      try {
        console.log(`🔄 Starting automatic indexing for: ${filename}`);
        await indexAllDocuments();
        console.log(`✅ Automatic indexing completed for new file: ${filename}`);
      } catch (error) {
        console.error(`❌ Automatic indexing failed for ${filename}:`, error.message);
      }
    }, 3000); // Wait 3 seconds before indexing
  }

  async onFileChanged(filePath) {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    if (!supportedExtensions.includes(ext)) {
      return;
    }

    console.log(`📝 File modified: ${filename}`);
    
    setTimeout(async () => {
      try {
        console.log(`🔄 Re-indexing modified file: ${filename}`);
        await indexAllDocuments();
        console.log(`✅ Re-indexing completed for modified file: ${filename}`);
      } catch (error) {
        console.error(`❌ Re-indexing failed for ${filename}:`, error.message);
      }
    }, 3000);
  }

  async onFileRemoved(filePath) {
    const filename = path.basename(filePath);
    console.log(`🗑️  File removed: ${filename}`);
    
    // Note: You might want to implement document removal from database here
    // For now, we'll just log the removal
  }

  onReady() {
    console.log('✅ File watcher is ready');
    
    // List initial files
    fs.readdir(this.watchPath, (err, files) => {
      if (err) {
        console.error('❌ Error reading docs directory:', err.message);
        return;
      }
      
      const supportedFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.pdf', '.docx', '.doc', '.txt'].includes(ext);
      });
      
      console.log(`📋 Found ${supportedFiles.length} supported files in docs directory`);
      if (supportedFiles.length > 0) {
        console.log('📄 Files:', supportedFiles.join(', '));
      }
    });
  }

  onError(error) {
    console.error('❌ File watcher error:', error.message);
  }

  getStatus() {
    return {
      isWatching: this.isWatching,
      watchPath: this.watchPath,
      supportedExtensions: ['.pdf', '.docx', '.doc', '.txt']
    };
  }
}

module.exports = new FileWatcherService();