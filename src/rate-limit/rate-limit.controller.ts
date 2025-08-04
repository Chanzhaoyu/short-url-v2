import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@Controller('api/v1/rate-limit')
@UseGuards(ApiKeyGuard)
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  /**
   * 获取所有速率限制状态
   */
  @Get('status')
  getAllRateLimits() {
    const rateLimits = this.rateLimitService.getAllRateLimits();
    const result: any[] = [];

    for (const [key, data] of rateLimits.entries()) {
      result.push({
        key,
        count: data.count,
        resetTime: new Date(data.resetTime).toISOString(),
        remaining: Math.floor((data.resetTime - Date.now()) / 1000),
      });
    }

    return {
      totalKeys: result.length,
      rateLimits: result,
    };
  }

  /**
   * 获取特定 key 的速率限制状态
   */
  @Get('status/:key')
  getRateLimitStatus(@Param('key') key: string) {
    // 使用默认配置获取状态
    const defaultConfig = {
      windowMs: 60 * 1000,
      max: 100,
    };

    const info = this.rateLimitService.getRateLimitInfo(key, defaultConfig);

    return {
      key,
      ...info,
      resetTime: new Date(info.resetTime).toISOString(),
    };
  }

  /**
   * 重置特定 key 的速率限制
   */
  @Delete('reset/:key')
  resetRateLimit(@Param('key') key: string) {
    this.rateLimitService.resetRateLimit(key);

    return {
      message: `Rate limit for key "${key}" has been reset`,
      key,
      resetAt: new Date().toISOString(),
    };
  }

  /**
   * 清理所有过期的速率限制
   */
  @Delete('cleanup')
  cleanup() {
    const beforeCount = this.rateLimitService.getAllRateLimits().size;
    // 触发清理（通过获取所有限制来清理过期的）
    const afterCount = this.rateLimitService.getAllRateLimits().size;

    return {
      message: 'Cleanup completed',
      removedEntries: beforeCount - afterCount,
      remainingEntries: afterCount,
      cleanupAt: new Date().toISOString(),
    };
  }
}
