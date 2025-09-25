const { sequelize } = require('../config/database');

// 导入模型
const User = require('./UserPostgres');
const Document = require('./DocumentPostgres');

// 定义模型关联
User.hasMany(Document, {
  foreignKey: 'uploadedBy',
  as: 'documents'
});

Document.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

// 同步模型关联
const syncAssociations = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized with associations');
  } catch (error) {
    console.error('❌ Failed to sync database models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Document,
  syncAssociations
};