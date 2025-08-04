import { Module, OnModuleInit } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitController } from './rate-limit.controller';
import { ApiKeyModule } from '../api-key/api-key.module';

@Module({
  imports: [ApiKeyModule],
  providers: [RateLimitService, RateLimitGuard],
  controllers: [RateLimitController],
  exports: [RateLimitService, RateLimitGuard],
})
export class RateLimitModule implements OnModuleInit {
  constructor(private rateLimitService: RateLimitService) {}

  onModuleInit() {
    // 启动清理任务，每分钟清理一次过期的缓存
    this.rateLimitService.startCleanupTask(60000);
  }
}
