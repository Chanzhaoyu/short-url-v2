import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Short URL API! 🚀\n\nEndpoints:\n- POST /auth/register - 用户注册\n- POST /auth/login - 用户登录\n- GET /auth/profile - 获取用户信息\n- POST /urls - 创建短链\n- GET /urls - 获取短链列表\n- GET /urls/:id - 获取短链详情\n- PATCH /urls/:id - 更新短链\n- DELETE /urls/:id - 删除短链\n- GET /urls/:id/analytics - 获取短链分析\n- GET /:shortCode - 短链重定向\n- GET /health - 健康检查';
  }

  getHelloHTML(): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Short URL API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
            backdrop-filter: blur(10px);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #4a5568;
            margin-bottom: 10px;
        }
        
        .emoji {
            font-size: 3rem;
            display: block;
            margin-bottom: 15px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #718096;
            margin-bottom: 30px;
        }
        
        .endpoints {
            background: #f7fafc;
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #667eea;
        }
        
        .endpoints h3 {
            color: #4a5568;
            margin-bottom: 20px;
            font-size: 1.3rem;
            display: flex;
            align-items: center;
        }
        
        .endpoints h3::before {
            content: "🔗";
            margin-right: 10px;
        }
        
        .endpoint-list {
            list-style: none;
        }
        
        .endpoint-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .endpoint-item:last-child {
            border-bottom: none;
        }
        
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-right: 15px;
            min-width: 50px;
            text-align: center;
        }
        
        .method.get { background: #48bb78; color: white; }
        .method.post { background: #4299e1; color: white; }
        .method.patch { background: #ed8936; color: white; }
        .method.delete { background: #f56565; color: white; }
        
        .endpoint-path {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-weight: 600;
            margin-right: 15px;
            color: #2d3748;
        }
        
        .endpoint-desc {
            color: #718096;
            flex: 1;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 0.9rem;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            background: #48bb78;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .status-badge::before {
            content: "●";
            margin-right: 6px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            
            .title {
                font-size: 2rem;
            }
            
            .endpoint-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="emoji">🚀</span>
            <h1 class="title">Short URL API</h1>
            <p class="subtitle">高性能短链接服务</p>
            <span class="status-badge">服务运行中</span>
        </div>
        
        <div class="endpoints">
            <h3>API 端点</h3>
            <ul class="endpoint-list">
                <li class="endpoint-item">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/auth/register</span>
                    <span class="endpoint-desc">用户注册</span>
                </li>
                <li class="endpoint-item">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/auth/login</span>
                    <span class="endpoint-desc">用户登录</span>
                </li>
                <li class="endpoint-item">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/auth/profile</span>
                    <span class="endpoint-desc">获取用户信息</span>
                </li>
                <li class="endpoint-item">
                    <span class="method post">POST</span>
                    <span class="endpoint-path">/urls</span>
                    <span class="endpoint-desc">创建短链</span>
                </li>
                <li class="endpoint-item">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/urls</span>
                    <span class="endpoint-desc">获取短链列表</span>
                </li>
                <li class="endpoint-item">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/urls/:id</span>
                    <span class="endpoint-desc">获取短链详情</span>
                </li>
                <li class="endpoint-item">
                    <span class="method patch">PATCH</span>
                    <span class="endpoint-path">/urls/:id</span>
                    <span class="endpoint-desc">更新短链</span>
                </li>
                <li class="endpoint-item">
                    <span class="method delete">DELETE</span>
                    <span class="endpoint-path">/urls/:id</span>
                    <span class="endpoint-desc">删除短链</span>
                </li>
                <li class="endpoint-item">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/urls/:id/analytics</span>
                    <span class="endpoint-desc">获取短链分析</span>
                </li>
                <li class="endpoint-item">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/:shortCode</span>
                    <span class="endpoint-desc">短链重定向</span>
                </li>
                <li class="endpoint-item">
                    <span class="method get">GET</span>
                    <span class="endpoint-path">/health</span>
                    <span class="endpoint-desc">健康检查</span>
                </li>
            </ul>
        </div>
        
        <div class="footer">
            <p>✨ 由 NestJS 强力驱动 | 🔒 安全可靠 | ⚡ 高性能</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  getHealthHTML(healthData: any): string {
    const formatUptime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours}h ${minutes}m ${secs}s`;
    };

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Check - Short URL API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: #333;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
            backdrop-filter: blur(10px);
            text-align: center;
        }
        
        .status-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }
        
        .title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #48bb78;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #718096;
            margin-bottom: 30px;
        }
        
        .health-info {
            background: #f7fafc;
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #48bb78;
            margin-bottom: 20px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .info-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s ease;
        }
        
        .info-item:hover {
            transform: translateY(-2px);
        }
        
        .info-label {
            font-size: 0.9rem;
            color: #718096;
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #2d3748;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            background: #48bb78;
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            margin: 20px 0;
        }
        
        .status-badge::before {
            content: "●";
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 0.9rem;
        }
        
        .refresh-btn {
            background: #48bb78;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
            margin-top: 10px;
        }
        
        .refresh-btn:hover {
            background: #38a169;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            
            .title {
                font-size: 2rem;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-icon">💚</div>
        <h1 class="title">系统健康</h1>
        <p class="subtitle">Short URL API 运行状态</p>
        
        <div class="status-badge">服务正常运行</div>
        
        <div class="health-info">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">状态</div>
                    <div class="info-value">${healthData.status.toUpperCase()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">运行时间</div>
                    <div class="info-value">${formatUptime(healthData.uptime)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">服务名称</div>
                    <div class="info-value">${healthData.service}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">版本</div>
                    <div class="info-value">v${healthData.version}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">检查时间</div>
                    <div class="info-value">${new Date(healthData.timestamp).toLocaleString('zh-CN')}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>🚀 系统运行正常 | 📊 所有服务可用</p>
            <button class="refresh-btn" onclick="window.location.reload()">刷新状态</button>
        </div>
    </div>
</body>
</html>
    `;
  }
}
