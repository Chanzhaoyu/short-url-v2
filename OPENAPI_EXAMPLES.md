# OpenAPI 使用示例

## 基本使用流程

### 1. 用户登录
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

### 2. 创建 API Key
```bash
curl -X POST http://localhost:3000/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Application Key",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }'
```

### 3. 使用 API Key 创建短链接
```bash
curl -X POST http://localhost:3000/api/v1/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "originalUrl": "https://www.example.com",
    "title": "Example Website",
    "description": "A demo website",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }'
```

### 4. 获取短链接列表
```bash
curl -X GET "http://localhost:3000/api/v1/urls?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 5. 获取短链接详情
```bash
curl -X GET http://localhost:3000/api/v1/urls/SHORT_CODE \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 6. 更新短链接
```bash
curl -X PATCH http://localhost:3000/api/v1/urls/SHORT_CODE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

### 7. 获取访问分析
```bash
curl -X GET http://localhost:3000/api/v1/urls/SHORT_CODE/analytics \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 8. 删除短链接
```bash
curl -X DELETE http://localhost:3000/api/v1/urls/SHORT_CODE \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## API Key 管理

### 列出所有 API Keys
```bash
curl -X GET http://localhost:3000/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 更新 API Key
```bash
curl -X PATCH http://localhost:3000/api-keys/API_KEY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated API Key Name",
    "isActive": true
  }'
```

### 删除 API Key
```bash
curl -X DELETE http://localhost:3000/api-keys/API_KEY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 认证方式

### JWT Token 认证 (用于 API Key 管理)
在请求头中添加：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key 认证 (用于短链接操作)
在请求头中添加：
```
Authorization: Bearer ak_1234567890abcdef...
```

## 响应格式

所有 API 响应都使用 JSON 格式，包含适当的 HTTP 状态码：

- `200 OK` - 成功
- `201 Created` - 创建成功
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 认证失败
- `403 Forbidden` - 权限不足
- `404 Not Found` - 资源不存在
- `409 Conflict` - 资源冲突
- `500 Internal Server Error` - 服务器错误
