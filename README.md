# RAG 文档问答系统

一个基于检索增强生成（RAG）的智能文档问答系统，支持多种文档格式，提供智能问答和文档管理功能。

## 🚀 功能特性

- ✅ **多格式文档支持**: PDF、DOCX、DOC、TXT
- ✅ **智能问答**: 基于向量搜索的精准问答
- ✅ **自动索引**: 文件监听自动触发文档索引
- ✅ **现代化界面**: React + Tailwind CSS 前端
- ✅ **RESTful API**: 完整的后端API接口
- ✅ **向量数据库**: Pinecone 向量存储和搜索

## 📋 当前系统状态

- **后端服务器**: 正常运行在 http://localhost:3001 ✅
- **前端界面**: 正常运行在 http://localhost:3000 ✅  
- **文件监听**: 已激活，监控 `/docs` 目录 ✅
- **Pinecone**: ✅ 已连接并配置完成
- **问答功能**: 现在使用向量搜索 ✅

您的RAG系统现在完全配置完成，具备：
- ✅ 自动文件监听和索引功能
- ✅ Pinecone向量搜索集成  
- ✅ 完整的问答能力
- ✅ 现代化前端界面

系统已准备好使用！您可以在浏览器中打开 http://localhost:3000 开始测试完整的RAG功能。

## 📊 API 文档

访问 http://localhost:3001/ 可以直接查看所有集成的 API 接口文档，包括：
- 完整的 API 端点列表
- 详细的请求/响应格式
- 实时测试功能
- 参数说明和使用示例

API 文档页面提供了直观的界面，方便开发者快速了解和使用所有后端服务接口。

## 🛠️ 技术栈

### 后端
- **Node.js + Express**: Web服务器框架
- **PostgreSQL**: 关系型数据库
- **Pinecone**: 向量数据库
- **Sequelize**: ORM数据库操作
- **OpenAI/Gemini**: 大语言模型集成

### 前端  
- **React 18**: 用户界面框架
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架
- **Axios**: HTTP客户端

## 快速开始

### 环境要求
- Node.js 16+
- PostgreSQL 12+
- Pinecone 账户
- OpenAI/Gemini API 密钥 (可选)

### 1. 克隆项目
```bash
git clone <repository-url>
cd ocase03
```

### 2. 后端设置
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# PostgreSQL 数据库
POSTGRESQL_URI=postgresql://postgres:password@localhost:5432/database

# Pinecone 向量数据库  
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=rag-documents

# AI 服务 (二选一)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# JWT 配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# 文件上传
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS 配置
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Pinecone 配置

1. 访问 [Pinecone 官网](https://www.pinecone.io/)
2. 注册账号并登录控制台
3. 获取 API 密钥和环境信息
4. 在 `.env` 文件中配置 Pinecone 参数

系统会在首次使用时自动创建名为 "rag-documents" 的索引：
- 维度: 1536 (OpenAI 嵌入维度)
- 度量: cosine 相似度  
- 规格: AWS us-east-1 serverless

```bash
# 启动开发服务器
npm run dev
```

### 3. 前端设置
```bash
# 进入前端目录（新终端）
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 访问应用
- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001
- 健康检查: http://localhost:3001/health

## 🔌 API 端点

### 核心端点
- `GET /health` - 健康检查
- `POST /api/qa/ask` - 问答接口
- `POST /api/indexing/index-docs` - 手动触发索引
- `GET /api/documents` - 文档列表
- `POST /api/upload` - 文件上传

### 问答API示例
```bash
curl -X POST http://localhost:3001/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "文档内容是什么？",
    "userId": 1
  }'
```

响应格式：
```json
{
  "question": "问题内容",
  "answer": "AI生成的回答", 
  "contextUsed": 3,
  "confidence": 0.85,
  "relevantChunks": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📁 文件结构

```
ocase03/
├── backend/                 # 后端代码
│   ├── config/             # 配置文件
│   ├── models/             # 数据模型
│   ├── routes/             # API路由
│   ├── services/           # 业务服务
│   ├── scripts/            # 脚本文件
│   ├── server.js           # 服务器入口
│   └── .env               # 环境变量
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   └── services/       # API服务
│   └── vite.config.js      # Vite配置
├── docs/                   # 文档存储目录
└── README.md              # 项目说明
```

## 🔄 开发模式

### 开发服务器
```bash
# 后端开发模式
cd backend && npm run dev

# 前端开发模式  
cd frontend && npm run dev
```

### 数据库同步
```bash
cd backend && npx sequelize-cli db:migrate
```

### 部署建议
- 使用 PM2 管理Node.js进程
- 配置 Nginx 反向代理
- 设置环境变量用于生产环境
- 启用SSL证书

## 🧪 测试功能

### 健康检查
```bash
curl http://localhost:3001/health
```

### 问答测试
```bash
curl -X POST http://localhost:3001/api/qa/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "测试问题", "userId": 1}'
```

### 手动触发索引
```bash
curl -X POST http://localhost:3001/api/indexing/index-docs
```

## 🚨 故障排除

### 常见问题

1. **端口占用**: 确保 3000 和 3001 端口空闲
2. **数据库连接**: 检查 PostgreSQL 服务状态
3. **Pinecone 连接**: 验证 API 密钥和环境配置
4. **文件权限**: 确保对 `docs/` 和 `uploads/` 目录有读写权限

### 日志查看

后端日志包含详细的操作信息：
- 数据库连接状态
- 文件监听事件  
- 索引处理进度
- API请求日志

## 许可证

MIT License - 详见 LICENSE 文件

## 支持

如有问题请提交 Issue 或联系开发团队。


- 文件监听 : 已激活，监控 /docs 目录 ✅
- Pinecone : ✅ 已连接并配置完成
- 问答功能 : 现在使用向量搜索 ✅
### 🔧 Pinecone配置详情
- 索引名称 : "rag-documents" (自动创建)
- 向量维度 : 1536 (OpenAI嵌入维度)
- 相似度度量 : cosine
- 环境区域 : AWS us-east-1 serverless
### 📝 新增内容
1. 1.
   当前系统状态 部分，显示所有服务正常运行
2. 2.
   Pinecone配置 详细说明，包括自动索引创建
3. 3.
   测试命令 示例，方便验证功能
4. 4.
   API端点 说明，包含问答接口示例
5. 5.
   文件结构 更新，反映实际项目结构
### 🧪 测试功能
添加了完整的测试命令：

- 健康检查: curl http://localhost:3001/health
- 问答测试: curl -X POST http://localhost:3001/api/qa/ask -H "Content-Type: application/json" -d '{"question": "测试问题", "userId": 1}'
- 手动索引: curl -X POST http://localhost:3001/api/indexing/index-docs
现在您的README文档已经完全更新，包含了系统的完整配置信息、使用说明和当前状态。用户可以通过 http://localhost:3000 访问前端界面开始测试完整的RAG功能。

系统已完全配置完成，具备：

- ✅ 自动文件监听和索引功能
- ✅ Pinecone向量搜索集成
- ✅ 完整的问答能力
- ✅ 现代化前端界面
您可以立即开始使用系统进行文档问答测试