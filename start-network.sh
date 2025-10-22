#!/bin/bash

# 创作伴侣 - 本地网络部署脚本

echo "🚀 启动创作伴侣 - 本地网络服务器"
echo ""

# 获取本地 IP 地址
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  警告: 无法获取 IP 地址，将只在 localhost 可用"
    LOCAL_IP="localhost"
fi

echo "📍 本地 IP 地址: $LOCAL_IP"
echo ""
echo "🌐 服务器将在以下地址可访问："
echo "   - 本机: http://localhost:3000"
echo "   - 局域网: http://$LOCAL_IP:3000"
echo ""
echo "📱 在局域网内的其他设备（手机、平板）上访问："
echo "   http://$LOCAL_IP:3000"
echo ""
echo "⏳ 正在启动服务器..."
echo ""

# 启动生产服务器，监听所有网络接口
HOST=0.0.0.0 PORT=3000 npm run start

