import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeCacheService } from './node-cache.service';
import { RedisCacheService } from './redis-cache.service';

export const CACHE_SERVICE = 'CACHE_SERVICE';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_SERVICE,
      useFactory: (configService: ConfigService) => {
        const cacheType = configService.get<string>('CACHE_TYPE', 'node-cache');

        if (cacheType === 'redis') {
          return new RedisCacheService(configService);
        } else {
          return new NodeCacheService();
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
