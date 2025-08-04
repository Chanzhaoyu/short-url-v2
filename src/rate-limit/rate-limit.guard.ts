import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from './rate-limit.service';
import { RATE_LIMIT_KEY } from './rate-limit.decorator';
import { RateLimitConfig } from './rate-limit.interface';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 获取速率限制配置
    const rateLimitConfig = this.reflector.getAllAndOverride<
      Partial<RateLimitConfig>
    >(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);

    if (!rateLimitConfig) {
      return true; // 没有配置速率限制，直接通过
    }

    // 设置默认配置
    const config: RateLimitConfig = {
      windowMs: 60 * 1000, // 默认 1 分钟
      max: 100, // 默认 100 次请求
      message: 'Too many requests, please try again later.',
      ...rateLimitConfig,
    };

    // 生成限制 key
    const key = this.generateKey(request, config);

    // 检查速率限制
    const { allowed, info } = this.rateLimitService.checkRateLimit(key, config);

    // 设置响应头
    response.set({
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': new Date(info.resetTime).toISOString(),
    });

    if (!allowed) {
      // 添加重试时间头
      const retryAfter = Math.ceil((info.resetTime - Date.now()) / 1000);
      response.set('Retry-After', retryAfter.toString());

      throw new HttpException(
        {
          error: 'Too Many Requests',
          message: config.message,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter: retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private generateKey(request: any, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    // 默认使用 API Key + IP + 路由作为 key
    const apiKey = request.user?.apiKey || 'anonymous';
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const route = `${request.method}:${request.route?.path || request.url}`;

    return `ratelimit:${apiKey}:${ip}:${route}`;
  }
}
