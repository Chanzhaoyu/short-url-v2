# OpenAPI 速率限制实现指南

## 概述

本文档详细介绍了如何为 OpenAPI 接口实现速率限制功能，以防止 API 滥用并确保服务的稳定性。

## 实现架构

### 核心组件

1. **RateLimitService** - 核心速率限制逻辑
2. **RateLimitGuard** - 请求拦截和验证
3. **RateLimitDecorator** - 配置装饰器
4. **RateLimitController** - 管理接口
5. **RedisRateLimitService** - Redis 存储版本（可选）

### 设计思路

#### 1. 速率限制策略

- **按 API Key 限制**：每个 API Key 独立计算限制
- **按接口类型限制**：不同操作类型有不同限制
- **滑动窗口**：使用时间窗口进行限制计算
- **分层限制**：支持全局和接口级别的限制

#### 2. 存储方案

**内存存储（默认）**
- 优点：性能高，无外部依赖
- 缺点：重启丢失，单机限制
- 适用：单机部署，开发测试

**Redis 存储（推荐）**
- 优点：持久化，支持集群
- 缺点：需要 Redis 依赖
- 适用：生产环境，集群部署

## 配置说明

### 预设限制配置

```typescript
export const RateLimitPresets = {
  STRICT: { windowMs: 60 * 1000, max: 10 },    // 严格：每分钟 10 次
  NORMAL: { windowMs: 60 * 1000, max: 60 },    // 普通：每分钟 60 次
  RELAXED: { windowMs: 60 * 1000, max: 100 },  // 宽松：每分钟 100 次
  CREATE: { windowMs: 60 * 1000, max: 20 },    // 创建：每分钟 20 次
  READ: { windowMs: 60 * 1000, max: 200 },     // 读取：每分钟 200 次
  UPDATE: { windowMs: 60 * 1000, max: 30 },    // 更新：每分钟 30 次
  DELETE: { windowMs: 60 * 1000, max: 10 },    // 删除：每分钟 10 次
};
```

### 自定义配置

```typescript
@RateLimit({
  windowMs: 5 * 60 * 1000,  // 5 分钟窗口
  max: 100,                 // 最大 100 次请求
  message: '请求过于频繁，请稍后再试',
  keyGenerator: (req) => `custom:${req.user.id}:${req.ip}`,
  skipIf: (req) => req.user.role === 'admin'
})
```

## 使用方法

### 1. 基本使用

```typescript
@Controller('api/v1')
@UseGuards(ApiKeyGuard, RateLimitGuard)
export class OpenApiController {
  
  @Post('urls')
  @RateLimit(RateLimitPresets.CREATE)
  create(@Body() createUrlDto: CreateUrlDto) {
    // 创建短链接，限制每分钟 20 次
  }

  @Get('urls')
  @RateLimit(RateLimitPresets.READ)
  findAll() {
    // 查询列表，限制每分钟 200 次
  }
}
```

### 2. 全局限制

```typescript
// 为整个控制器设置默认限制
@Controller('api/v1')
@UseGuards(ApiKeyGuard, RateLimitGuard)
@RateLimit(RateLimitPresets.NORMAL)
export class OpenApiController {
  // 所有方法默认每分钟 60 次限制
}
```

### 3. 方法级覆盖

```typescript
@Controller('api/v1')
@UseGuards(ApiKeyGuard, RateLimitGuard)
@RateLimit(RateLimitPresets.NORMAL)  // 默认限制
export class OpenApiController {
  
  @Post('urls')
  @RateLimit(RateLimitPresets.CREATE)  // 覆盖默认限制
  create() {
    // 使用创建操作的特定限制
  }
}
```

## 响应格式

### 成功响应头

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 2024-08-04T10:30:00.000Z
```

### 限制超出响应

**状态码**: 429 Too Many Requests

```json
{
  "error": "Too Many Requests",
  "message": "Too many requests, please try again later.",
  "statusCode": 429,
  "retryAfter": 45
}
```

**响应头**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-08-04T10:30:00.000Z
Retry-After: 45
```

## 管理接口

### 查看速率限制状态

```bash
GET /api/v1/rate-limit/status
```

```json
{
  "totalKeys": 5,
  "rateLimits": [
    {
      "key": "ratelimit:api-key-123:127.0.0.1:POST:/api/v1/urls",
      "count": 15,
      "resetTime": "2024-08-04T10:30:00.000Z",
      "remaining": 25
    }
  ]
}
```

### 重置特定限制

```bash
DELETE /api/v1/rate-limit/reset/{key}
```

### 清理过期限制

```bash
DELETE /api/v1/rate-limit/cleanup
```

## 测试

### 运行测试脚本

```bash
# 设置 API Key
export API_KEY="your-api-key-here"

# 运行测试
chmod +x test-rate-limit.sh
./test-rate-limit.sh
```

### 手动测试

```bash
# 快速发送多个请求测试限制
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/v1/urls \
    -H "Content-Type: application/json" \
    -H "X-API-KEY: your-api-key" \
    -d '{"originalUrl":"https://example.com/test-'$i'"}' \
    -w "Status: %{http_code}\n"
done
```

## 性能优化

### 1. 内存清理

- 自动清理过期条目
- 定期清理任务（默认每分钟）
- 手动清理接口

### 2. Redis 优化

```typescript
// 使用 Redis 集群
const redisConfig = {
  host: 'redis-cluster',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
};
```

### 3. 降级策略

- Redis 连接失败时降级到内存存储
- 异常情况下允许请求通过
- 日志记录和监控

## 监控告警

### 关键指标

- 限制触发次数
- 平均响应时间
- 限制键数量
- Redis 连接状态

### 告警设置

```typescript
// 监控装饰器示例
@Monitor({
  metric: 'rate_limit_exceeded',
  threshold: 100,
  window: '5m'
})
@RateLimit(RateLimitPresets.CREATE)
create() {
  // 当 5 分钟内限制超出 100 次时告警
}
```

## 最佳实践

### 1. 限制配置

- 根据 API 重要性设置不同限制
- 读操作限制相对宽松
- 写操作限制相对严格
- 删除操作限制最严格

### 2. 错误处理

- 提供友好的错误信息
- 包含重试时间建议
- 支持多语言错误信息

### 3. 用户体验

- 在客户端实现重试机制
- 显示限制状态给用户
- 提供批量操作接口

### 4. 安全考虑

- 结合 API Key 验证
- 防止暴力破解
- 记录异常请求行为

## 扩展功能

### 1. 动态配置

```typescript
// 支持运行时修改限制
@RateLimit({
  windowMs: () => config.getRateLimitWindow(),
  max: () => config.getRateLimitMax()
})
```

### 2. 基于角色的限制

```typescript
// 不同用户角色不同限制
@RateLimit({
  max: (req) => req.user.role === 'premium' ? 1000 : 100
})
```

### 3. 地理位置限制

```typescript
// 基于 IP 地址的地理位置限制
@RateLimit({
  max: (req) => geoip.lookup(req.ip).country === 'CN' ? 200 : 50
})
```

## 故障排除

### 常见问题

1. **限制不生效**
   - 检查守卫是否正确注册
   - 确认装饰器语法正确
   - 验证模块导入关系

2. **Redis 连接失败**
   - 检查 Redis 服务状态
   - 验证连接配置
   - 查看网络连通性

3. **性能问题**
   - 监控内存使用
   - 优化清理频率
   - 考虑使用 Redis

### 调试模式

```typescript
// 启用详细日志
@RateLimit({
  ...RateLimitPresets.CREATE,
  debug: true
})
```

## 总结

通过实现上述速率限制功能，可以有效地：

- 防止 API 滥用
- 保护系统资源
- 提供公平的服务访问
- 增强系统稳定性
- 支持灵活的限制策略

速率限制是 API 安全和稳定性的重要组成部分，需要根据实际业务需求进行适当的配置和调优。
