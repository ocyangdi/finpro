const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.ENUM('pdf', 'docx', 'doc', 'txt'),
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  wordCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  characterCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  chunkCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  processingStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  processingError: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  isIndexed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      fields: ['uploadedBy', 'createdAt']
    },
    {
      fields: ['processingStatus']
    },
    {
      fields: ['isIndexed']
    }
  ]
});

// 虚拟字段：状态
Object.defineProperty(Document.prototype, 'status', {
  get: function() {
    if (this.processingStatus === 'failed') return 'error';
    if (this.processingStatus === 'completed' && this.isIndexed) return 'ready';
    if (this.processingStatus === 'completed') return 'processed';
    return this.processingStatus;
  }
});

// 虚拟字段：预览
Object.defineProperty(Document.prototype, 'preview', {
  get: function() {
    if (this.content && this.content.length > 0) {
      return this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '');
    }
    return '';
  }
});

// 静态方法：获取文档统计信息
Document.getStats = async function(userId = null) {
  const whereClause = userId ? { uploadedBy: userId } : {};
  
  const result = await Document.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalDocuments'],
      [sequelize.fn('SUM', sequelize.col('wordCount')), 'totalWords'],
      [sequelize.fn('SUM', sequelize.col('characterCount')), 'totalCharacters'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"processingStatus\" = 'completed' AND \"isIndexed\" = true THEN 1 ELSE 0 END")), 'readyDocuments'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"processingStatus\" = 'processing' THEN 1 ELSE 0 END")), 'processingDocuments'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN \"processingStatus\" = 'failed' THEN 1 ELSE 0 END")), 'failedDocuments']
    ],
    raw: true
  });

  return result[0] || {
    totalDocuments: 0,
    totalWords: 0,
    totalCharacters: 0,
    readyDocuments: 0,
    processingDocuments: 0,
    failedDocuments: 0
  };
};

// 实例方法：更新处理状态
Document.prototype.updateStatus = async function(status, error = null) {
  this.processingStatus = status;
  
  if (error) {
    this.processingError = error.message || String(error);
  }
  
  if (status === 'completed') {
    this.processedAt = new Date();
  }
  
  await this.save();
};

// 定义关联
Document.associate = function(models) {
  Document.belongsTo(models.User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
  });
};

module.exports = Document;