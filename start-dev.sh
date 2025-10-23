#!/bin/bash

# AI Identity Creator - 开发服务器启动脚本
# 使用 tmux 管理开发服务器

SESSION_NAME="ai-identity-dev"
PROJECT_DIR="/Users/siqihe/siqi-vibe/ai-identity building"

echo "🚀 AI Identity Creator - 启动脚本"
echo ""

# 检查 tmux 是否安装
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux 未安装"
    echo ""
    echo "请先安装 tmux："
    echo "  sudo chown -R siqihe /opt/homebrew"
    echo "  brew install tmux"
    echo ""
    echo "或者使用临时方案（不依赖 tmux）："
    echo "  ./start-dev-simple.sh"
    exit 1
fi

# 检查是否已有会话在运行
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "⚠️  开发服务器已在运行"
    echo ""
    echo "选项："
    echo "  1. 查看服务器: tmux attach -t $SESSION_NAME"
    echo "  2. 重启服务器: ./start-dev.sh restart"
    echo "  3. 停止服务器: ./stop-dev.sh"
    echo ""
    
    if [ "$1" == "restart" ]; then
        echo "🔄 重启服务器..."
        tmux kill-session -t "$SESSION_NAME"
        sleep 2
    else
        exit 0
    fi
fi

# 停止所有现有的 Next.js 进程
echo "🧹 清理旧进程..."
pkill -f "next dev" 2>/dev/null
sleep 1

# 创建新的 tmux 会话并启动开发服务器
echo "✨ 创建新的 tmux 会话: $SESSION_NAME"
tmux new-session -d -s "$SESSION_NAME" -c "$PROJECT_DIR"

# 在 tmux 会话中运行开发服务器
tmux send-keys -t "$SESSION_NAME" "npm run dev" Enter

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 3

# 检查服务器状态
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo ""
    echo "✅ 开发服务器已启动！"
    echo ""
    echo "📱 访问地址："
    echo "  - 本机: http://localhost:3000"
    echo "  - 手机: http://$(ipconfig getifaddr en0):3000"
    echo ""
    echo "🎮 管理命令："
    echo "  - 查看服务器: tmux attach -t $SESSION_NAME"
    echo "  - 退出查看: 按 Ctrl+B 然后按 D"
    echo "  - 重启服务器: ./start-dev.sh restart"
    echo "  - 停止服务器: ./stop-dev.sh"
    echo ""
else
    echo "❌ 启动失败，请检查错误信息"
fi


