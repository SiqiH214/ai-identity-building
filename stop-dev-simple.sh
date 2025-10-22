#!/bin/bash

# AI Identity Creator - 停止简单启动的服务器

PROJECT_DIR="/Users/siqihe/siqi-vibe/ai-identity building"
PID_FILE="$PROJECT_DIR/dev-server.pid"

echo "🛑 停止开发服务器..."

# 停止记录的进程
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ 进程已停止 (PID: $PID)"
    fi
    rm -f "$PID_FILE"
fi

# 停止所有 Next.js 进程（以防万一）
pkill -f "next dev" 2>/dev/null
echo "✅ 所有 Next.js 进程已停止"

echo ""
echo "✅ 开发服务器已完全停止"

