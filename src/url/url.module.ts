import { Module } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, ConfigModule, CacheModule],
  controllers: [UrlController],
  providers: [UrlService],
})
export class UrlModule {}
