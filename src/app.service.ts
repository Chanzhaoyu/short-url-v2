import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Short URL API! 🚀\n\nEndpoints:\n- POST /auth/register - 用户注册\n- POST /auth/login - 用户登录\n- GET /auth/profile - 获取用户信息\n- POST /urls - 创建短链\n- GET /urls - 获取短链列表\n- GET /urls/:id - 获取短链详情\n- PATCH /urls/:id - 更新短链\n- DELETE /urls/:id - 删除短链\n- GET /urls/:id/analytics - 获取短链分析\n- GET /:shortCode - 短链重定向\n- GET /health - 健康检查';
  }
}
