import { Injectable } from '@nestjs/common';
import {
  RateLimitConfig,
  RateLimitData,
  RateLimitInfo,
} from './rate-limit.interface';

@Injectable()
export class RateLimitService {
  private cache = new Map<string, RateLimitData>();

  /**
   * 检查是否超过速率限制
   */
  checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): { allowed: boolean; info: RateLimitInfo } {
    const now = Date.now();

    // 获取或创建速率限制数据
    let data = this.cache.get(key);

    if (!data || data.resetTime <= now) {
      // 创建新的时间窗口
      data = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    // 检查是否超过限制
    const allowed = data.count < config.max;

    if (allowed) {
      data.count++;
      this.cache.set(key, data);
    }

    const info: RateLimitInfo = {
      totalRequests: data.count,
      remaining: Math.max(0, config.max - data.count),
      resetTime: data.resetTime,
      limit: config.max,
    };

    return { allowed, info };
  }

  /**
   * 获取速率限制信息
   */
  getRateLimitInfo(key: string, config: RateLimitConfig): RateLimitInfo {
    const data = this.cache.get(key);
    const now = Date.now();

    if (!data || data.resetTime <= now) {
      return {
        totalRequests: 0,
        remaining: config.max,
        resetTime: now + config.windowMs,
        limit: config.max,
      };
    }

    return {
      totalRequests: data.count,
      remaining: Math.max(0, config.max - data.count),
      resetTime: data.resetTime,
      limit: config.max,
    };
  }

  /**
   * 重置特定 key 的速率限制
   */
  resetRateLimit(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 获取所有速率限制状态
   */
  getAllRateLimits(): Map<string, RateLimitData> {
    const now = Date.now();
    const validEntries = new Map<string, RateLimitData>();

    for (const [key, data] of this.cache.entries()) {
      if (data.resetTime > now) {
        validEntries.set(key, data);
      } else {
        // 清理过期的条目
        this.cache.delete(key);
      }
    }

    return validEntries;
  }

  /**
   * 清理过期的缓存条目
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (data.resetTime <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 启动定期清理任务
   */
  startCleanupTask(intervalMs: number = 60000): void {
    setInterval(() => {
      this.cleanExpiredEntries();
    }, intervalMs);
  }
}
