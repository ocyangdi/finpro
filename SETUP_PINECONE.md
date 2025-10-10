# Pinecone 配置指南

## 1. 获取 Pinecone API 密钥

1. 访问 [Pinecone 官网](https://www.pinecone.io/)
2. 注册账号并登录
3. 进入控制台创建项目
4. 在 API Keys 部分获取您的 API 密钥

## 2. 配置环境变量

编辑 `/backend/.env` 文件，将以下配置替换为您的实际值：

```env
# Pinecone Configuration
PINECONE_API_KEY=您的实际Pinecone API密钥
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=rag-documents
```

## 3. 重启服务器

配置完成后，需要重启后端服务器以使配置生效：

```bash
cd backend
npm start
```

## 4. 验证配置

服务器启动时应该显示：
- ✅ Pinecone client initialized successfully
- ✅ Database models synchronized with associations
- 👀 Watching for file changes in: /docs

## 5. 测试向量搜索功能

配置成功后，问答功能将使用向量搜索而不是简单的关键词匹配，提供更准确的回答。

## 注意事项

- 确保您的 Pinecone 账户有足够的额度
- 首次启动时会自动创建名为 "rag-documents" 的索引
- 索引创建可能需要几分钟时间
- 如果遇到连接问题，请检查网络连接和API密钥权限