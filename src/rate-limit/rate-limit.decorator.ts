import { SetMetadata } from '@nestjs/common';
import { RateLimitConfig } from './rate-limit.interface';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * 速率限制装饰器
 * @param config 速率限制配置
 */
export const RateLimit = (config: Partial<RateLimitConfig>) =>
  SetMetadata(RATE_LIMIT_KEY, config);

/**
 * 预设的速率限制配置
 */
export const RateLimitPresets = {
  // 严格限制：每分钟 10 次请求
  STRICT: { windowMs: 60 * 1000, max: 10 },

  // 普通限制：每分钟 60 次请求
  NORMAL: { windowMs: 60 * 1000, max: 60 },

  // 宽松限制：每分钟 100 次请求
  RELAXED: { windowMs: 60 * 1000, max: 100 },

  // 创建操作：每分钟 20 次
  CREATE: { windowMs: 60 * 1000, max: 20 },

  // 查询操作：每分钟 200 次
  READ: { windowMs: 60 * 1000, max: 200 },

  // 更新操作：每分钟 30 次
  UPDATE: { windowMs: 60 * 1000, max: 30 },

  // 删除操作：每分钟 10 次
  DELETE: { windowMs: 60 * 1000, max: 10 },
};
