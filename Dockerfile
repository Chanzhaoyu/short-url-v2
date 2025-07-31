# 使用官方 Node.js 18 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制所有源代码
COPY . .

# 生成 Prisma 客户端
RUN pnpm run db:generate

# 构建应用
RUN pnpm run build

# 暴露端口
EXPOSE 3000

# 创建启动脚本
RUN echo '#!/bin/sh\npnpm run db:migrate\nnode dist/main' > start.sh && chmod +x start.sh

# 启动应用
CMD ["./start.sh"]
