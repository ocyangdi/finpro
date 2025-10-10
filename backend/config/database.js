const { Sequelize } = require('sequelize');

// 创建 Sequelize 实例
const sequelize = new Sequelize(process.env.POSTGRESQL_URI || 'postgresql://postgres:123@localhost:5432/postgres', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  const { syncAssociations } = require('../models');
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully');
    
    // 同步数据库和模型关联（开发环境使用）
    if (process.env.NODE_ENV === 'development') {
      await syncAssociations();
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
};

// 关闭连接处理
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('PostgreSQL connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

// 应用终止时关闭连接
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { sequelize, connectDB, closeDB };