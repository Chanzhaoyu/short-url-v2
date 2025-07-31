import { Module } from '@nestjs/common';
import { OpenApiController } from './open-api.controller';
import { UrlModule } from '../url/url.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [UrlModule, ApiKeyModule, PrismaModule, CacheModule],
  controllers: [OpenApiController],
})
export class OpenApiModule {}
