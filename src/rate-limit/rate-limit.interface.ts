export interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求数
  keyGenerator?: (req: any) => string; // 自定义 key 生成器
  skipIf?: (req: any) => boolean; // 跳过条件
  message?: string; // 限制时的错误消息
}

export interface RateLimitInfo {
  totalRequests: number;
  remaining: number;
  resetTime: number;
  limit: number;
}

export interface RateLimitData {
  count: number;
  resetTime: number;
}
