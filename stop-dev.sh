#!/bin/bash

# AI Identity Creator - 停止开发服务器

SESSION_NAME="ai-identity-dev"

echo "🛑 停止开发服务器..."

# 停止 tmux 会话
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux kill-session -t "$SESSION_NAME"
    echo "✅ tmux 会话已停止"
fi

# 停止所有 Next.js 进程（以防万一）
pkill -f "next dev" 2>/dev/null
echo "✅ 所有 Next.js 进程已停止"

echo ""
echo "✅ 开发服务器已完全停止"

