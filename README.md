# 短链服务 API

一个基于 NestJS、Prisma 和 SQLite 构建的短链服务后端，支持用户认证、链接管理和访问统计。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT 身份认证
- ✅ 创建和管理短链
- ✅ 自定义短码支持
- ✅ 链接访问统计
- ✅ 链接过期时间设置
- ✅ 点击分析和统计
- ✅ 链接启用/禁用

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
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
