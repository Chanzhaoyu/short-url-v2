#!/bin/bash

# OpenAPI 功能测试脚本

echo "🚀 开始测试 OpenAPI 功能..."

BASE_URL="http://localhost:3000"

# 清理之前的测试数据
echo "📝 准备测试环境..."

# 1. 用户登录
echo "1️⃣ 用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "api_user",
    "password": "password123"
  }')

echo "登录响应: $LOGIN_RESPONSE"

# 提取 token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，退出测试"
  exit 1
fi

echo "✅ 用户登录成功，获得 token: ${TOKEN:0:20}..."

# 2. 创建 API Key
echo ""
echo "2️⃣ 创建 API Key..."
API_KEY_RESPONSE=$(curl -s -X POST "$BASE_URL/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test API Key"
  }')

echo "API Key 创建响应: $API_KEY_RESPONSE"

# 提取 API Key
API_KEY=$(echo $API_KEY_RESPONSE | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
  echo "❌ API Key 创建失败，退出测试"
  exit 1
fi

echo "✅ API Key 创建成功: ${API_KEY:0:20}..."

# 3. 列出用户的 API Keys
echo ""
echo "3️⃣ 列出用户的 API Keys..."
LIST_API_KEYS_RESPONSE=$(curl -s -X GET "$BASE_URL/api-keys" \
  -H "Authorization: Bearer $TOKEN")

echo "API Keys 列表: $LIST_API_KEYS_RESPONSE"

# 4. 使用 API Key 创建短链接
echo ""
echo "4️⃣ 使用 API Key 创建短链接..."
CREATE_URL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/urls" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "originalUrl": "https://nestjs.com",
    "title": "NestJS Official Website"
  }')

echo "短链接创建响应: $CREATE_URL_RESPONSE"

# 提取短代码
SHORT_CODE=$(echo $CREATE_URL_RESPONSE | grep -o '"shortCode":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SHORT_CODE" ]; then
  echo "❌ 短链接创建失败"
  exit 1
fi

echo "✅ 短链接创建成功，短代码: $SHORT_CODE"

# 5. 使用 API Key 获取短链接列表
echo ""
echo "5️⃣ 使用 API Key 获取短链接列表..."
LIST_URLS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/urls" \
  -H "Authorization: Bearer $API_KEY")

echo "短链接列表响应: $LIST_URLS_RESPONSE"

# 6. 使用 API Key 获取单个短链接详情
echo ""
echo "6️⃣ 使用 API Key 获取短链接详情..."
GET_URL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/urls/$SHORT_CODE" \
  -H "Authorization: Bearer $API_KEY")

echo "短链接详情响应: $GET_URL_RESPONSE"

# 7. 使用 API Key 更新短链接
echo ""
echo "7️⃣ 使用 API Key 更新短链接..."
UPDATE_URL_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/v1/urls/$SHORT_CODE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "title": "Updated NestJS Website",
    "description": "Updated through API Key"
  }')

echo "短链接更新响应: $UPDATE_URL_RESPONSE"

# 8. 测试短链接重定向
echo ""
echo "8️⃣ 测试短链接重定向..."
REDIRECT_RESPONSE=$(curl -s -I "$BASE_URL/$SHORT_CODE")
echo "重定向响应头:"
echo "$REDIRECT_RESPONSE"

# 9. 使用 API Key 获取分析数据
echo ""
echo "9️⃣ 使用 API Key 获取分析数据..."
ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/urls/$SHORT_CODE/analytics" \
  -H "Authorization: Bearer $API_KEY")

echo "分析数据响应: $ANALYTICS_RESPONSE"

# 10. 测试错误的 API Key
echo ""
echo "🔟 测试错误的 API Key..."
INVALID_API_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/urls" \
  -H "Authorization: Bearer invalid_api_key")

echo "错误 API Key 响应: $INVALID_API_RESPONSE"

# 11. 更新 API Key
echo ""
echo "1️⃣1️⃣ 更新 API Key..."
API_KEY_ID=$(echo $API_KEY_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

UPDATE_API_KEY_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api-keys/$API_KEY_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Test API Key"
  }')

echo "API Key 更新响应: $UPDATE_API_KEY_RESPONSE"

# 12. 使用 API Key 删除短链接
echo ""
echo "1️⃣2️⃣ 使用 API Key 删除短链接..."
DELETE_URL_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/v1/urls/$SHORT_CODE" \
  -H "Authorization: Bearer $API_KEY")

echo "短链接删除响应: $DELETE_URL_RESPONSE"

# 13. 删除 API Key
echo ""
echo "1️⃣3️⃣ 删除 API Key..."
DELETE_API_KEY_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api-keys/$API_KEY_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "API Key 删除响应: $DELETE_API_KEY_RESPONSE"

# 14. 验证删除后的状态
echo ""
echo "1️⃣4️⃣ 验证删除后的状态..."
VERIFY_DELETE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/urls" \
  -H "Authorization: Bearer $API_KEY")

echo "删除后验证响应: $VERIFY_DELETE_RESPONSE"

echo ""
echo "🎉 OpenAPI 功能测试完成！"
