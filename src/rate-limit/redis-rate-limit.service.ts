import { Injectable, Inject } from '@nestjs/common';
import {
  RateLimitConfig,
  RateLimitData,
  RateLimitInfo,
} from './rate-limit.interface';

@Injectable()
export class RedisRateLimitService {
  constructor(@Inject('REDIS_CLIENT') private redisClient: any) {}

  /**
   * 检查是否超过速率限制 (Redis 版本)
   */
  async checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const redisKey = `ratelimit:${key}`;

    try {
      // 使用 Redis 的 ZREMRANGEBYSCORE 和 ZCARD 原子操作
      const pipeline = this.redisClient.multi();

      // 移除过期的记录
      pipeline.zremrangebyscore(redisKey, 0, windowStart);

      // 获取当前窗口内的请求数量
      pipeline.zcard(redisKey);

      // 如果允许，添加当前请求
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

      // 设置过期时间
      pipeline.expire(redisKey, Math.ceil(config.windowMs / 1000));

      const results = await pipeline.exec();
      const currentCount = results[1][1]; // ZCARD 的结果

      const allowed = currentCount < config.max;

      if (!allowed) {
        // 如果不允许，移除刚才添加的记录
        await this.redisClient.zrem(redisKey, `${now}-${Math.random()}`);
      }

      // 获取窗口重置时间
      const earliestRequest = await this.redisClient.zrange(
        redisKey,
        0,
        0,
        'WITHSCORES',
      );
      const resetTime =
        earliestRequest.length > 0
          ? parseInt(earliestRequest[1]) + config.windowMs
          : now + config.windowMs;

      const info: RateLimitInfo = {
        totalRequests: allowed ? currentCount + 1 : currentCount,
        remaining: Math.max(
          0,
          config.max - (allowed ? currentCount + 1 : currentCount),
        ),
        resetTime,
        limit: config.max,
      };

      return { allowed, info };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      // 降级到允许请求
      return {
        allowed: true,
        info: {
          totalRequests: 0,
          remaining: config.max,
          resetTime: now + config.windowMs,
          limit: config.max,
        },
      };
    }
  }

  /**
   * 获取速率限制信息 (Redis 版本)
   */
  async getRateLimitInfo(
    key: string,
    config: RateLimitConfig,
  ): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const redisKey = `ratelimit:${key}`;

    try {
      // 清理过期记录并获取当前计数
      await this.redisClient.zremrangebyscore(redisKey, 0, windowStart);
      const currentCount = await this.redisClient.zcard(redisKey);

      // 获取最早的请求时间来计算重置时间
      const earliestRequest = await this.redisClient.zrange(
        redisKey,
        0,
        0,
        'WITHSCORES',
      );
      const resetTime =
        earliestRequest.length > 0
          ? parseInt(earliestRequest[1]) + config.windowMs
          : now + config.windowMs;

      return {
        totalRequests: currentCount,
        remaining: Math.max(0, config.max - currentCount),
        resetTime,
        limit: config.max,
      };
    } catch (error) {
      console.error('Redis rate limit info error:', error);
      return {
        totalRequests: 0,
        remaining: config.max,
        resetTime: now + config.windowMs,
        limit: config.max,
      };
    }
  }

  /**
   * 重置特定 key 的速率限制 (Redis 版本)
   */
  async resetRateLimit(key: string): Promise<void> {
    const redisKey = `ratelimit:${key}`;
    try {
      await this.redisClient.del(redisKey);
    } catch (error) {
      console.error('Redis rate limit reset error:', error);
    }
  }

  /**
   * 获取所有速率限制状态 (Redis 版本)
   */
  async getAllRateLimits(): Promise<Map<string, RateLimitData>> {
    const result = new Map<string, RateLimitData>();

    try {
      const keys = await this.redisClient.keys('ratelimit:*');

      for (const redisKey of keys) {
        const key = redisKey.replace('ratelimit:', '');
        const count = await this.redisClient.zcard(redisKey);
        const ttl = await this.redisClient.ttl(redisKey);

        if (ttl > 0) {
          result.set(key, {
            count,
            resetTime: Date.now() + ttl * 1000,
          });
        }
      }
    } catch (error) {
      console.error('Redis get all rate limits error:', error);
    }

    return result;
  }
}
