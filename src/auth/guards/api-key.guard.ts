import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from '../../api-key/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    const validation = await this.apiKeyService.validateApiKey(apiKey);

    if (!validation) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // 将用户信息添加到请求对象中
    request.user = {
      userId: validation.userId,
      apiKeyId: validation.apiKeyId,
    };

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return null;
    }

    // 支持 "Bearer ak_xxx" 或 "ak_xxx" 格式
    if (authorization.startsWith('Bearer ')) {
      return authorization.substring(7);
    }

    // 直接使用 API Key
    if (authorization.startsWith('ak_')) {
      return authorization;
    }

    return null;
  }
}
