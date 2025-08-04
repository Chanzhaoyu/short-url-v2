#!/bin/bash

# 速率限制测试脚本
# 测试 OpenAPI 接口的速率限制功能

# 设置变量
BASE_URL="${BASE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-your-api-key-here}"

echo "🔒 开始测试速率限制功能..."
echo "Base URL: $BASE_URL"
echo "API Key: $API_KEY"
echo ""

# 辅助函数：发送请求并显示结果
test_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local description="$4"

    echo "📋 测试: $description"
    echo "请求: $method $url"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTP_STATUS:%{http_code}\nRESPONSE_TIME:%{time_total}\n" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -H "X-API-KEY: $API_KEY" \
            -d "$data" \
            "$BASE_URL$url")
    else
        response=$(curl -s -w "HTTP_STATUS:%{http_code}\nRESPONSE_TIME:%{time_total}\n" \
            -X "$method" \
            -H "X-API-KEY: $API_KEY" \
            "$BASE_URL$url")
    fi
    
    # 提取 HTTP 状态码和响应时间
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_time=$(echo "$response" | grep "RESPONSE_TIME:" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_STATUS:/d' | sed '/RESPONSE_TIME:/d')
    
    echo "状态码: $http_status"
    echo "响应时间: ${response_time}s"
    
    # 提取速率限制相关的头信息
    if [ "$http_status" = "429" ]; then
        echo "❌ 请求被速率限制阻止"
        echo "响应内容: $response_body"
    elif [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
        echo "✅ 请求成功"
    else
        echo "⚠️  请求失败，状态码: $http_status"
        echo "响应内容: $response_body"
    fi
    
    echo "---"
}

# 测试速率限制状态查看
echo "🔍 测试速率限制状态查看..."
test_request "GET" "/api/v1/rate-limit/status" "" "获取所有速率限制状态"

echo ""
echo "📈 开始快速连续请求测试..."

# 测试创建 URL 的速率限制（每分钟 20 次）
echo "🚀 测试创建 URL 速率限制 (每分钟 20 次)..."
for i in {1..25}; do
    echo "请求 #$i"
    test_request "POST" "/api/v1/urls" '{"originalUrl":"https://example.com/test-'$i'","customCode":"test'$i'"}' "创建短链接 #$i"
    
    # 如果被限制，显示更多信息
    if [ $? -eq 0 ]; then
        # 检查速率限制状态
        echo "检查当前速率限制状态..."
        test_request "GET" "/api/v1/rate-limit/status" "" "查看限制状态"
    fi
    
    # 每 5 个请求暂停一下
    if [ $((i % 5)) -eq 0 ]; then
        echo "暂停 2 秒..."
        sleep 2
    fi
done

echo ""
echo "📊 测试读取操作的速率限制 (每分钟 200 次)..."
for i in {1..10}; do
    echo "读取请求 #$i"
    test_request "GET" "/api/v1/urls" "" "获取 URL 列表 #$i"
    sleep 0.1
done

echo ""
echo "🧹 测试清理速率限制..."
test_request "DELETE" "/api/v1/rate-limit/cleanup" "" "清理过期的速率限制"

echo ""
echo "🎯 测试自定义速率限制密钥重置..."
# 假设我们知道一个特定的速率限制 key
test_request "DELETE" "/api/v1/rate-limit/reset/ratelimit:$API_KEY:127.0.0.1:POST:/api/v1/urls" "" "重置特定速率限制"

echo ""
echo "✅ 速率限制测试完成！"
echo ""
echo "💡 测试总结："
echo "- 创建操作限制: 每分钟 20 次请求"
echo "- 读取操作限制: 每分钟 200 次请求"
echo "- 更新操作限制: 每分钟 30 次请求"
echo "- 删除操作限制: 每分钟 10 次请求"
echo ""
echo "🔧 如何使用:"
echo "1. 设置环境变量 API_KEY 为你的 API 密钥"
echo "2. 可选：设置 BASE_URL (默认: http://localhost:3000)"
echo "3. 运行脚本: ./test-rate-limit.sh"
echo ""
echo "📚 查看速率限制状态: GET /api/v1/rate-limit/status"
echo "🔄 重置特定限制: DELETE /api/v1/rate-limit/reset/{key}"
echo "🧹 清理过期限制: DELETE /api/v1/rate-limit/cleanup"
