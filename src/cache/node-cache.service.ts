import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { CacheService } from './cache.interface';

@Injectable()
export class NodeCacheService implements CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 默认 TTL 5分钟
      checkperiod: 60, // 每60秒检查过期的键
    });
  }

  get<T>(key: string): Promise<T | null> {
    const value = this.cache.get<T>(key);
    return Promise.resolve(value || null);
  }

  set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl !== undefined) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.cache.del(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.cache.flushAll();
    return Promise.resolve();
  }
}
