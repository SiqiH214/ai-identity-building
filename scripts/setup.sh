#!/bin/bash

# 创作伴侣 - 快速安装脚本

echo "🎨 欢迎使用创作伴侣 AI 身份生成工具"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null
then
    echo "❌ 错误: 未检测到 Node.js"
    echo "请访问 https://nodejs.org 安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo ""
echo "✅ 依赖安装完成"
echo ""

# 检查 .env.local 文件
if [ ! -f .env.local ]; then
    echo "⚠️  提示: 未检测到 .env.local 文件"
    echo "正在创建示例配置文件..."
    cat > .env.local << EOL
# OpenAI API Key (可选)
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Key (必需)
GEMINI_API_KEY=your_gemini_api_key_here
EOL
    echo "✅ 已创建 .env.local 文件"
    echo "⚠️  请编辑 .env.local 并填入你的 API 密钥"
else
    echo "✅ 检测到 .env.local 文件"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env.local 文件，填入你的 API 密钥"
echo "2. 运行 'npm run dev' 启动开发服务器"
echo "3. 在浏览器中打开 http://localhost:3000"
echo ""
echo "获取 API 密钥："
echo "- Gemini: https://makersuite.google.com/app/apikey"
echo "- OpenAI: https://platform.openai.com/api-keys"
echo ""

