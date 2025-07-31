# 短链服务 API 文档

这是一个基于 NestJS、Prisma 和 SQLite 构建的现代化短链服务，支持用户认证和缓存功能。

## 🚀 功能特性

### 核心功能
- ✅ 短链生成和管理
- ✅ URL 重定向
- ✅ 访问统计和分析
- ✅ 用户认证 (JWT)
- ✅ 缓存系统 (node-cache/Redis)

### 技术栈
- **后端框架**: NestJS 11.x
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT + Passport
- **缓存**: node-cache (默认) / Redis (可选)
- **验证**: class-validator + class-transformer
- **密码加密**: bcrypt

## 📁 项目结构

```
src/
├── auth/                 # 认证模块
│   ├── guards/          # JWT 守卫
│   ├── strategies/      # Passport 策略
│   └── dto/            # 认证 DTO
├── url/                 # URL 管理模块
│   ├── dto/            # URL DTO
│   └── entities/       # URL 实体
├── cache/              # 缓存模块
│   ├── cache.interface.ts
│   ├── node-cache.service.ts
│   ├── redis-cache.service.ts
│   └── cache.module.ts
├── prisma/             # Prisma 服务
└── main.ts             # 应用入口
```

## 🔧 环境配置

### 环境变量 (.env)
```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# 应用配置
APP_PORT=3000
APP_URL="http://localhost:3000"

# 缓存配置
CACHE_TYPE="node-cache"  # 选项: "node-cache" 或 "redis"
CACHE_TTL=300           # 缓存时间 (秒)

# Redis 配置 (仅在 CACHE_TYPE="redis" 时使用)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
```

## 🏃‍♂️ 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 初始化数据库
```bash
npx prisma migrate dev --name init
```

### 3. 启动开发服务器
```bash
pnpm run start:dev
```

### 4. 访问应用
- API: http://localhost:3000
- 健康检查: http://localhost:3000/health

## 📚 API 接口

### 认证接口

#### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
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
Authorization: Bearer <JWT_TOKEN>
```

### URL 管理接口

#### 创建短链
```http
POST /urls
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "originalUrl": "https://www.example.com",
  "title": "Example Site",
  "description": "An example website",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### 获取用户的所有短链
```http
GET /urls
Authorization: Bearer <JWT_TOKEN>
```

#### 获取特定短链详情
```http
GET /urls/:id
Authorization: Bearer <JWT_TOKEN>
```

#### 更新短链
```http
PATCH /urls/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "isActive": false
}
```

#### 删除短链
```http
DELETE /urls/:id
Authorization: Bearer <JWT_TOKEN>
```

#### 获取短链访问统计
```http
GET /urls/:id/analytics
Authorization: Bearer <JWT_TOKEN>
```

#### 短链重定向 (公开接口)
```http
GET /:shortCode
```

### 系统接口

#### 健康检查
```http
GET /health
```

## 🎯 缓存系统

### node-cache (默认)
- 内存缓存，适合单机部署
- 配置简单，无需额外服务
- 重启后缓存丢失

### Redis (可选)
- 持久化缓存，适合集群部署
- 支持数据持久化
- 需要 Redis 服务器

### 切换缓存类型
在 `.env` 文件中修改 `CACHE_TYPE` 的值：
- `"node-cache"` - 使用内存缓存
- `"redis"` - 使用 Redis 缓存

## 🔐 认证机制

### JWT Token
- 使用 Bearer Token 认证
- Token 有效期：7天 (可配置)
- 自动验证用户身份

### 密码安全
- 使用 bcrypt 加密存储
- 支持密码强度验证
- 防止明文存储

## 📊 数据模型

### User (用户)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  urls      Url[]
}
```

### Url (短链)
```prisma
model Url {
  id          String    @id @default(cuid())
  shortCode   String    @unique
  originalUrl String
  title       String?
  description String?
  clickCount  Int       @default(0)
  isActive    Boolean   @default(true)
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id])
}
```

## 🚀 部署说明

### 生产环境配置
1. 修改 JWT_SECRET 为安全的随机字符串
2. 配置生产数据库 (PostgreSQL/MySQL)
3. 设置 Redis 缓存 (推荐)
4. 配置反向代理 (Nginx)
5. 设置 HTTPS

### Docker 部署
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

## 🧪 测试

### 单元测试
```bash
pnpm run test
```

### E2E 测试
```bash
pnpm run test:e2e
```

### 测试覆盖率
```bash
pnpm run test:cov
```

## 📝 开发笔记

### 实现特点
1. **模块化设计**: 清晰的模块分离，便于维护
2. **类型安全**: 完整的 TypeScript 支持
3. **数据验证**: 使用 DTO + class-validator
4. **错误处理**: 统一的异常处理机制
5. **缓存优化**: 支持多种缓存策略
6. **安全性**: JWT 认证 + 密码加密

### 性能优化
- 短链重定向缓存，减少数据库查询
- 索引优化，提升查询性能
- 连接池管理，提高并发处理能力

## 📞 支持

如有问题或建议，请提交 Issue 或 Pull Request。

---

**项目状态**: ✅ 已完成核心功能，生产环境就绪
