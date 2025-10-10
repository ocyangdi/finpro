# RAG 文档问答系统 - 详细使用指南

## 🚀 系统概述

RAG文档问答系统是一个基于检索增强生成技术的智能文档处理平台，集成了OCBC AI（Wingman服务）和多种AI能力，为企业提供智能化的文档管理和问答服务。

## 📋 系统运行方法

### 1. 环境准备

确保您的系统满足以下要求：
- Node.js 16+ 
- PostgreSQL 12+
- Pinecone 向量数据库账户
- 可选的AI服务API密钥

### 2. 快速启动

#### 后端服务启动
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置数据库和AI服务参数

# 启动开发服务器
npm run dev
```

后端服务将在 http://localhost:3001 启动，提供以下核心功能：
- 文档上传和管理
- 自动索引和向量化
- AI问答服务
- OCBC Wingman集成

#### 前端服务启动
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 启动，提供现代化用户界面。

### 3. 系统功能验证

启动后，通过以下方式验证系统状态：

1. **健康检查**: 访问 http://localhost:3001/health
2. **前端界面**: 访问 http://localhost:3000
3. **API文档**: 访问 http://localhost:3001/

## 🤖 OCBC AI (Wingman) 集成

### 功能特性

OCBC AI Wingman服务是系统的核心AI组件，提供以下能力：

#### 1. 智能聊天服务
- **端点**: `POST /api/wingman/chat`
- **功能**: 基于OCBC Wingman的智能对话
- **优先级**: 最高优先级（优先级1）

#### 2. 服务状态
- **启用状态**: ✅ 已启用
- **服务状态**: active
- **类型**: AI聊天服务

### API 使用示例

#### Wingman 聊天接口

```javascript
// 请求示例
const response = await fetch('http://localhost:3001/api/wingman/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: "请帮我分析这份财务报告"
  })
});

// 响应格式
{
  "success": true,
  "data": {
    "answer": "Wingman生成的智能回复",
    "service": "wingman",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 获取所有服务状态

```bash
curl -X GET http://localhost:3001/api/services
```

响应示例：
```json
{
  "success": true,
  "data": [
    {
      "name": "Wingman Service",
      "endpoint": "/api/wingman",
      "description": "OCBC Wingman聊天服务",
      "type": "ai",
      "enabled": true,
      "status": "active",
      "priority": 1
    },
    {
      "name": "QA Service",
      "endpoint": "/api/qa",
      "description": "基于文档的问答服务",
      "type": "rag",
      "enabled": true,
      "status": "active",
      "priority": 2
    },
    {
      "name": "Copilot Service",
      "endpoint": "/api/copilot",
      "description": "Microsoft Copilot集成服务",
      "type": "ai",
      "enabled": true,
      "status": "active",
      "priority": 3
    }
  ]
}
```

## 🔧 系统架构

### 后端架构

```
backend/
├── routes/
│   ├── wingman.js          # OCBC AI Wingman路由
│   ├── services.js         # 服务状态管理
│   ├── qa.js              # RAG问答服务
│   └── ...其他路由
├── services/
│   ├── wingmanService.js   # Wingman服务实现
│   ├── qaService.js        # RAG问答服务
│   └── ...其他服务
└── server.js              # 服务器入口
```

### 前端架构

```
frontend/
├── src/
│   ├── components/
│   │   └── ChatWindow.jsx  # 聊天窗口组件
│   ├── pages/
│   │   ├── Documents.jsx   # 文档管理
│   │   └── Copilot.jsx     # AI助手页面
│   └── services/
│       └── api.js          # API服务封装
└── ...其他文件
```

## 📊 服务优先级系统

系统采用优先级机制管理AI服务：

1. **优先级 1**: OCBC Wingman服务 - 企业级AI助手
2. **优先级 2**: RAG问答服务 - 基于文档的智能问答
3. **优先级 3**: Copilot服务 - Microsoft AI集成

## 🔍 故障排除

### 常见问题

#### 1. Wingman服务连接失败
- 检查网络连接
- 验证Wingman服务端点可用性
- 查看服务日志获取详细错误信息

#### 2. 前端React警告
系统已修复所有React key属性警告：
- ChatWindow组件中的列表项已添加唯一key
- 文档选择器选项已正确配置key属性

#### 3. 服务启动失败
- 检查端口占用情况
- 验证环境变量配置
- 查看控制台错误日志

### 日志查看

```bash
# 后端日志
cd backend && npm run dev

# 前端日志  
cd frontend && npm run dev
```

## 🚀 部署说明

### 生产环境部署

1. **环境配置**
   ```bash
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=您的域名
   ```

2. **构建前端**
   ```bash
   cd frontend && npm run build
   ```

3. **启动服务**
   ```bash
   # 使用PM2等进程管理器
   pm2 start ecosystem.config.js
   ```

## 📞 技术支持

如有技术问题，请参考：
- API文档: http://localhost:3001/
- 系统日志: 查看控制台输出
- 服务状态: 访问 `/api/services` 端点

---

**注意**: 本系统集成了OCBC Wingman企业级AI服务，请确保遵守相关使用条款和隐私政策。