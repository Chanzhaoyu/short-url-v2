import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CacheService } from './cache.interface';
import { CACHE_SERVICE } from './cache.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cache')
@UseGuards(JwtAuthGuard)
export class CacheController {
  constructor(@Inject(CACHE_SERVICE) private cacheService: CacheService) {}

  @Delete('clear')
  async clearCache() {
    await this.cacheService.clear();
    return { message: '缓存已清空' };
  }

  @Delete('url/:shortCode')
  async clearUrlCache(@Param('shortCode') shortCode: string) {
    await this.cacheService.del(`url:${shortCode}`);
    return { message: `短链 ${shortCode} 的缓存已清除` };
  }

  @Get('stats')
  async getCacheStats() {
    return {
      message: '缓存统计功能需要根据具体缓存实现来添加',
      cache_type: process.env.CACHE_TYPE || 'node-cache',
    };
  }
}
