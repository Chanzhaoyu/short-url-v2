import { Module } from '@nestjs/common';
import { OpenApiController } from './open-api.controller';
import { UrlModule } from '../url/url.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [
    UrlModule,
    ApiKeyModule,
    PrismaModule,
    CacheModule,
    RateLimitModule,
  ],
  controllers: [OpenApiController],
})
export class OpenApiModule {}
