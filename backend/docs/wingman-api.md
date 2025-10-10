# Wingman 聊天服务 API 文档

## 概述

Wingman 聊天服务已成功集成到项目中，提供与 OCBC Wingman 服务的聊天功能集成。

## 基础信息

- **服务地址**: `https://ocbcwingman.ml-3ab7a488-2a6.apps.apps.prod7.ocbc.com/api/wingman/stream`
- **本地端点**: `http://localhost:3001/api/wingman`
- **请求方式**: POST
- **内容类型**: `application/json`

## API 端点

### 1. 聊天接口

**端点**: `POST /api/wingman/chat`

**描述**: 使用 Wingman 服务进行聊天

**请求体**:
```json
{
  "question": "你的问题内容",
  "conversation_history": [
    {
      "role": "user",
      "content": "之前的问题"
    },
    {
      "role": "assistant", 
      "content": "之前的回答"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "answer": "Wingman 的回答内容",
    "service": "wingman",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. 流式聊天接口

**端点**: `POST /api/wingman/stream`

**描述**: 使用 Wingman 服务进行流式聊天（实时响应）

**请求体**:
```json
{
  "question": "你的问题内容"
}
```

**响应**: 流式文本响应

### 3. 服务状态检查

**端点**: `GET /api/wingman/status`

**描述**: 检查 Wingman 服务状态

**响应示例**:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "status": "active",
    "message": "Wingman service is available"
  }
}
```

### 4. 服务能力信息

**端点**: `GET /api/wingman/capabilities`

**描述**: 获取 Wingman 服务能力信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "name": "OCBC Wingman",
    "enabled": true,
    "features": [
      "chat_completion",
      "streaming_chat", 
      "enterprise_grade"
    ],
    "models": ["wingman-chat"]
  }
}
```

### 5. 启用/禁用服务

**启用服务**: `POST /api/wingman/enable`
**禁用服务**: `POST /api/wingman/disable`

## 服务集成

### 所有可用服务列表

**端点**: `GET /api/services`

**描述**: 获取项目中所有可用的 AI 服务列表

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "name": "QA Service",
      "endpoint": "/api/qa",
      "description": "基于文档的问答服务",
      "type": "rag",
      "enabled": true,
      "status": "active"
    },
    {
      "name": "Copilot Service",
      "endpoint": "/api/copilot", 
      "description": "Microsoft Copilot集成服务",
      "type": "ai",
      "enabled": true,
      "status": "active"
    },
    {
      "name": "Wingman Service",
      "endpoint": "/api/wingman",
      "description": "OCBC Wingman聊天服务",
      "type": "ai",
      "enabled": true,
      "status": "active"
    }
  ]
}
```

### 特定服务状态

**端点**: `GET /api/services/:name/status`

**描述**: 获取特定服务的详细状态信息

**示例**: `GET /api/services/wingman/status`

## 使用示例

### JavaScript 示例

```javascript
// 使用 Wingman 聊天服务
const response = await fetch('http://localhost:3001/api/wingman/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: '请介绍一下 OCBC 银行的服务',
    conversation_history: []
  })
});

const result = await response.json();
console.log(result.data.answer);
```

### cURL 示例

```bash
# 测试服务状态
curl -X GET http://localhost:3001/api/wingman/status

# 发送聊天请求
curl -X POST http://localhost:3001/api/wingman/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "你好，请介绍一下你自己"}'
```

## 错误处理

所有 API 端点都包含标准的错误处理机制：

```json
{
  "error": "错误描述信息"
}
```

常见错误代码：
- `400`: 请求参数错误
- `500`: 服务器内部错误
- `503`: 服务不可用

## 注意事项

1. **超时设置**: Wingman 服务请求设置了 30 秒超时
2. **流式响应**: 流式聊天接口适合实时对话场景
3. **服务状态**: 建议在使用前检查服务状态
4. **企业级**: Wingman 服务为企业级服务，具有高可用性保障

## 部署信息

- **本地开发**: `http://localhost:3001/api/wingman`
- **生产环境**: 根据实际部署环境调整基础 URL

Wingman 服务已成功集成到项目中，可以作为可用的 AI 服务之一使用。