const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'doc', 'txt']
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  characterCount: {
    type: Number,
    default: 0
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: {
    type: String,
    default: ''
  },
  isIndexed: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
documentSchema.index({ uploadedBy: 1, uploadedAt: -1 });
documentSchema.index({ processingStatus: 1 });
documentSchema.index({ isIndexed: 1 });

documentSchema.virtual('status').get(function() {
  if (this.processingStatus === 'failed') return 'error';
  if (this.processingStatus === 'completed' && this.isIndexed) return 'ready';
  if (this.processingStatus === 'completed') return 'processed';
  return this.processingStatus;
});

documentSchema.virtual('preview').get(function() {
  if (this.content && this.content.length > 0) {
    return this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '');
  }
  return '';
});

// Static method to get document statistics
documentSchema.statics.getStats = async function(userId = null) {
  const matchStage = userId ? { uploadedBy: mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        totalCharacters: { $sum: '$characterCount' },
        readyDocuments: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$processingStatus', 'completed'] },
                { $eq: ['$isIndexed', true] }
              ]}, 1, 0
            ]
          }
        },
        processingDocuments: {
          $sum: {
            $cond: [
              { $eq: ['$processingStatus', 'processing'] }, 1, 0
            ]
          }
        },
        failedDocuments: {
          $sum: {
            $cond: [
              { $eq: ['$processingStatus', 'failed'] }, 1, 0
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalDocuments: 0,
    totalWords: 0,
    totalCharacters: 0,
    readyDocuments: 0,
    processingDocuments: 0,
    failedDocuments: 0
  };
};

// Instance method to update processing status
documentSchema.methods.updateStatus = async function(status, error = null) {
  this.processingStatus = status;
  
  if (error) {
    this.processingError = error.message || String(error);
  }
  
  if (status === 'completed') {
    this.processedAt = new Date();
  }
  
  await this.save();
};

module.exports = mongoose.model('Document', documentSchema);