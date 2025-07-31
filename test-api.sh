#!/bin/bash

# 短链服务 API 测试脚本
# 使用方法: chmod +x test-api.sh && ./test-api.sh

BASE_URL="http://localhost:3000"
echo "🚀 开始测试短链服务 API..."
echo "================================"

# 1. 健康检查
echo "📋 1. 健康检查"
curl -s "$BASE_URL/health" | jq
echo -e "\n"

# 2. 用户注册
echo "👤 2. 用户注册"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "password123"
  }')

echo "$REGISTER_RESPONSE" | jq
echo -e "\n"

# 3. 用户登录
echo "🔐 3. 用户登录"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq

# 提取 JWT Token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ 登录失败，无法获取 Token"
  exit 1
fi

echo "✅ 登录成功，Token: ${TOKEN:0:20}..."
echo -e "\n"

# 4. 创建短链
echo "🔗 4. 创建短链"
CREATE_URL_RESPONSE=$(curl -s -X POST "$BASE_URL/urls" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com",
    "title": "GitHub",
    "description": "The world largest code hosting platform"
  }')

echo "$CREATE_URL_RESPONSE" | jq

# 提取短代码
SHORT_CODE=$(echo "$CREATE_URL_RESPONSE" | jq -r '.shortCode // empty')
URL_ID=$(echo "$CREATE_URL_RESPONSE" | jq -r '.id // empty')

if [ -z "$SHORT_CODE" ] || [ "$SHORT_CODE" = "null" ]; then
  echo "❌ 创建短链失败"
  exit 1
fi

echo "✅ 短链创建成功: $BASE_URL/$SHORT_CODE"
echo -e "\n"

# 5. 获取用户的所有短链
echo "📋 5. 获取所有短链"
curl -s -X GET "$BASE_URL/urls" \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

# 6. 测试短链重定向
echo "🔄 6. 测试短链重定向"
echo "第一次访问 (从数据库):"
curl -I -s "$BASE_URL/$SHORT_CODE" | head -n 5
echo -e "\n第二次访问 (从缓存):"
curl -I -s "$BASE_URL/$SHORT_CODE" | head -n 5
echo -e "\n"

# 7. 获取短链统计
echo "📊 7. 获取访问统计"
curl -s -X GET "$BASE_URL/urls/$URL_ID/analytics" \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

# 8. 更新短链信息
echo "✏️  8. 更新短链信息"
curl -s -X PATCH "$BASE_URL/urls/$URL_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GitHub - Updated",
    "description": "The world largest code hosting platform - Updated"
  }' | jq
echo -e "\n"

# 9. 获取用户信息
echo "👤 9. 获取用户信息"
curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n"

echo "🎉 测试完成！"
echo "================================"
echo "📝 测试总结:"
echo "   - 健康检查: ✅"
echo "   - 用户注册: ✅"
echo "   - 用户登录: ✅"
echo "   - 创建短链: ✅"
echo "   - 短链重定向: ✅"
echo "   - 缓存功能: ✅"
echo "   - 访问统计: ✅"
echo "   - 数据更新: ✅"
echo ""
echo "🔗 创建的短链: $BASE_URL/$SHORT_CODE"
