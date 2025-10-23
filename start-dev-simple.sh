#!/bin/bash

# AI Identity Creator - 简单启动脚本（不依赖 tmux）
# 使用 nohup 在后台运行

PROJECT_DIR="/Users/siqihe/siqi-vibe/ai-identity building"
LOG_FILE="$PROJECT_DIR/dev-server.log"
PID_FILE="$PROJECT_DIR/dev-server.pid"

echo "🚀 AI Identity Creator - 简单启动脚本"
echo ""

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  开发服务器已在运行 (PID: $PID)"
        echo ""
        echo "查看日志: tail -f $LOG_FILE"
        echo "停止服务器: ./stop-dev-simple.sh"
        exit 0
    fi
fi

# 停止所有现有的 Next.js 进程
echo "🧹 清理旧进程..."
pkill -f "next dev" 2>/dev/null
sleep 1

# 启动开发服务器
cd "$PROJECT_DIR"
echo "✨ 启动开发服务器..."
nohup npm run dev > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 3

PID=$(cat "$PID_FILE")
if ps -p $PID > /dev/null 2>&1; then
    echo ""
    echo "✅ 开发服务器已启动！(PID: $PID)"
    echo ""
    echo "📱 访问地址："
    echo "  - 本机: http://localhost:3000"
    echo "  - 手机: http://$(ipconfig getifaddr en0):3000"
    echo ""
    echo "📋 管理命令："
    echo "  - 查看日志: tail -f $LOG_FILE"
    echo "  - 停止服务器: ./stop-dev-simple.sh"
    echo ""
else
    echo "❌ 启动失败，请查看日志: cat $LOG_FILE"
    rm -f "$PID_FILE"
fi


