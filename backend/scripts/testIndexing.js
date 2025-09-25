const { indexAllDocuments } = require('./indexDocs');

async function testIndexing() {
  try {
    console.log('🧪 Starting document indexing test...');
    
    const result = await indexAllDocuments();
    
    console.log('✅ Test completed successfully!');
    console.log('Summary:');
    console.log(`- Total files processed: ${result.totalFiles}`);
    console.log(`- Successfully indexed: ${result.successful}`);
    console.log(`- Failed: ${result.failed}`);
    
    if (result.failedFiles.length > 0) {
      console.log('\nFailed files:');
      result.failedFiles.forEach(file => {
        console.log(`  - ${file.filename}: ${file.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testIndexing();
}

module.exports = { testIndexing };