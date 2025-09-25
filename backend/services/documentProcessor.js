const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

class DocumentProcessor {
  constructor() {
    this.supportedFormats = ['.pdf', '.docx', '.doc', '.txt'];
  }

  async processDocument(filePath, originalName) {
    const extension = path.extname(originalName).toLowerCase();
    
    if (!this.supportedFormats.includes(extension)) {
      throw new Error(`Unsupported file format: ${extension}`);
    }

    try {
      let content = '';
      
      switch (extension) {
        case '.pdf':
          content = await this.processPDF(filePath);
          break;
        case '.docx':
        case '.doc':
          content = await this.processWord(filePath);
          break;
        case '.txt':
          content = await this.processText(filePath);
          break;
      }

      return {
        content,
        wordCount: this.countWords(content),
        characterCount: content.length,
        processed: true
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async processPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      
      // Clean up text
      let text = data.text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();
      
      return text;
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  async processWord(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      
      let text = result.value
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      return text;
    } catch (error) {
      throw new Error(`Word document processing failed: ${error.message}`);
    }
  }

  async processText(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
    } catch (error) {
      throw new Error(`Text file processing failed: ${error.message}`);
    }
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      let end = start + chunkSize;
      
      // Try to break at sentence end
      const sentenceEnd = text.slice(end - 50, end + 50).search(/[.!?]\s/);
      if (sentenceEnd > -1) {
        end = start + (end - 50) + sentenceEnd + 1;
      }
      
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push({
          text: chunk,
          start: start,
          end: end
        });
      }
      
      start = end - overlap;
      if (start < 0) start = 0;
    }
    
    return chunks;
  }
}

module.exports = new DocumentProcessor();