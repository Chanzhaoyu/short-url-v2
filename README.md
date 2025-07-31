# 🔗 短链服务 API

一个基于 NestJS、Prisma 和 SQLite 构建的现代化短链服务，支持用户认证和智能缓存。

## ✨ 特性

- 🚀 **高性能**: 支持 node-cache 和 Redis 双重缓存策略
- 🔐 **安全认证**: JWT + bcrypt 密码加密
- � **OpenAPI 支持**: API Key 管理，支持第三方应用集成
- �📊 **数据分析**: 详细的访问统计和分析
- 🛡️ **类型安全**: 完整的 TypeScript 支持
- 🏗️ **模块化**: 清晰的架构设计，易于扩展
- 🎯 **生产就绪**: 完整的错误处理和验证机制

## 🚀 快速开始

### 前置要求
- Node.js 18+
- pnpm (推荐) 或 npm

### 安装和运行

```bash
# 安装依赖
pnpm install

# 初始化数据库
npx prisma migrate dev --name init

# 启动开发服务器
pnpm run start:dev
```

服务将在 `http://localhost:3000` 启动

### 快速测试

```bash
# 给测试脚本添加执行权限
chmod +x test-api.sh

# 运行完整的 API 测试
./test-api.sh

# 运行 OpenAPI 功能测试
chmod +x test-openapi.sh
./test-openapi.sh
```

## 📚 API 使用示例

### 1. 用户注册和登录

```bash
# 注册用户
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 登录获取 Token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. 创建和管理短链

```bash
# 创建短链
curl -X POST http://localhost:3000/urls \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com",
    "title": "GitHub",
    "description": "Code hosting platform"
  }'

# 访问短链 (会自动重定向)
curl -L http://localhost:3000/SHORT_CODE
```

### 3. 缓存配置

在 `.env` 文件中配置缓存类型：

```env
# 使用内存缓存 (默认)
CACHE_TYPE="node-cache"

# 或使用 Redis 缓存
CACHE_TYPE="redis"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 4. OpenAPI / API Key 使用

#### 创建 API Key

```bash
# 首先登录获取 JWT Token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}' | \
  jq -r '.token')

# 创建 API Key
curl -X POST http://localhost:3000/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "My API Key"}'
```

#### 使用 API Key 调用 API

```bash
# 使用 API Key 创建短链
curl -X POST http://localhost:3000/api/v1/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "originalUrl": "https://example.com",
    "title": "Example Site"
  }'

# 使用 API Key 获取短链列表
curl -X GET http://localhost:3000/api/v1/urls \
  -H "Authorization: Bearer YOUR_API_KEY"

# 使用 API Key 获取分析数据
curl -X GET http://localhost:3000/api/v1/urls/SHORT_CODE/analytics \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### API Key 管理

```bash
# 列出所有 API Keys
curl -X GET http://localhost:3000/api-keys \
  -H "Authorization: Bearer $TOKEN"

# 更新 API Key
curl -X PATCH http://localhost:3000/api-keys/API_KEY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Updated API Key Name"}'

# 删除 API Key
curl -X DELETE http://localhost:3000/api-keys/API_KEY_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 功能概览

| 功能 | 状态 | 描述 |
|------|------|------|
| 用户注册/登录 | ✅ | JWT 认证，密码加密 |
| API Key 管理 | ✅ | 生成、删除和管理 API Keys |
| OpenAPI 支持 | ✅ | 通过 API Key 调用所有短链功能 |
| 短链生成 | ✅ | 自动生成唯一短代码 |
| 短链重定向 | ✅ | 快速重定向到原始 URL |
| 访问统计 | ✅ | 点击次数和分析数据 |
| 缓存系统 | ✅ | node-cache/Redis 双选择 |
| URL 管理 | ✅ | 增删改查完整功能 |
| 过期设置 | ✅ | 支持设置链接过期时间 |
| 用户权限 | ✅ | 用户只能管理自己的链接 |

---

📖 **详细文档**: 查看 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) 获取完整的 API 文档

**项目状态**: ✅ 生产环境就绪

- ✅ 用户注册和登录
- ✅ JWT 身份认证
- ✅ API Key 管理系统
- ✅ OpenAPI 第三方集成支持
- ✅ 创建和管理短链
- ✅ 自定义短码支持
- ✅ 链接访问统计
- ✅ 链接过期时间设置
- ✅ 点击分析和统计
- ✅ 链接启用/禁用
- ✅ 双重缓存系统 (node-cache/Redis)

## 技术栈

- **后端框架**: NestJS
- **数据库**: SQLite
- **ORM**: Prisma
- **认证**: JWT + Passport
- **验证**: class-validator

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

项目已经包含了 `.env` 文件，包含以下配置：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
APP_PORT=3000
APP_URL="http://localhost:3000"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm run db:generate

# 运行数据库迁移
pnpm run db:migrate
```

### 4. 启动开发服务器

```bash
pnpm run start:dev
```

服务将在 `http://localhost:3000` 启动。

### 5. 查看数据库（可选）

```bash
pnpm run db:studio
```

## API 端点

### 认证相关

#### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "testuser",
  "password": "password123"
}
```

#### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

#### 获取用户信息
```http
GET /auth/profile
Authorization: Bearer <your-jwt-token>
```

### 短链管理

#### 创建短链
```http
POST /urls
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "originalUrl": "https://www.example.com",
  "shortCode": "custom", // 可选，自定义短码
  "title": "示例网站", // 可选
  "description": "这是一个示例网站", // 可选
  "expiresAt": "2024-12-31T23:59:59.000Z" // 可选，过期时间
}
```

#### 获取短链列表
```http
GET /urls?page=1&limit=10
Authorization: Bearer <your-jwt-token>
```

#### 获取短链详情
```http
GET /urls/:id
Authorization: Bearer <your-jwt-token>
```

#### 更新短链
```http
PATCH /urls/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "新标题",
  "isActive": false
}
```

#### 删除短链
```http
DELETE /urls/:id
Authorization: Bearer <your-jwt-token>
```

#### 获取短链统计
```http
GET /urls/:id/analytics?days=7
Authorization: Bearer <your-jwt-token>
```

### 短链重定向

#### 访问短链（重定向）
```http
GET /:shortCode
```

### 系统信息

#### 健康检查
```http
GET /health
```

#### 欢迎页面
```http
GET /
```

## 数据库模型

### User（用户）
- `id`: 用户唯一标识
- `email`: 邮箱地址
- `username`: 用户名
- `password`: 加密后的密码
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Url（短链）
- `id`: 短链唯一标识
- `shortCode`: 短码
- `originalUrl`: 原始链接
- `title`: 标题
- `description`: 描述
- `clickCount`: 点击次数
- `isActive`: 是否启用
- `expiresAt`: 过期时间
- `userId`: 所属用户 ID
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Click（点击记录）
- `id`: 点击记录唯一标识
- `ipAddress`: IP 地址
- `userAgent`: 用户代理
- `referer`: 来源页面
- `country`: 国家
- `city`: 城市
- `urlId`: 所属短链 ID
- `createdAt`: 点击时间

## 开发脚本

```bash
# 开发模式启动
pnpm run start:dev

# 生产模式构建
pnpm run build

# 启动生产服务
pnpm run start:prod

# 代码格式化
pnpm run format

# 代码检查
pnpm run lint

# 运行测试
pnpm run test

# 数据库相关
pnpm run db:generate    # 生成 Prisma 客户端
pnpm run db:migrate     # 运行数据库迁移
pnpm run db:push        # 推送模式变更到数据库
pnpm run db:studio      # 打开 Prisma Studio
pnpm run db:reset       # 重置数据库
```

## 部署

### 环境变量配置

生产环境中，请确保修改以下环境变量：

```env
JWT_SECRET="your-production-secret-key"
APP_URL="https://your-domain.com"
```

### Docker 部署（可选）

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

## 许可证

MIT