# 创作伴侣 - AI 身份生成工具

一个流畅、情感化的创作工具，让创作者使用自己的身份（或虚拟身份）生成个性化的图像和视频。

## ✨ 核心理念

这不是一个文本生成图像的工具，而是一个**真实的创作伴侣** —— 直观、个性化，根植于人类想象。

## 🎯 主要功能

### 1. 身份管理
- 上传自拍照片
- 切换多个身份
- 创建虚拟角色

### 2. 自然创作流程
- 使用日常语言描述场景
- 语音输入支持
- 智能建议系统
- 位置选择器（预设位置 + 搜索）
- 灵感生成器

### 3. AI 图像生成
- 基于 Gemini Nanobanana API
- 生成 4 张高质量图像
- 保持面部身份一致性
- 专业摄影质感

### 4. 后期编辑
- **风格**: 时尚、电影、梦幻、街头、简约、复古
- **动作**: 行走、转身、微笑、挥手、坐下
- **声音**: 环境音、背景音乐

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
OPENAI_API_KEY=你的_OpenAI_密钥
GEMINI_API_KEY=你的_Gemini_密钥
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 🏗️ 技术栈

- **框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **类型**: TypeScript

## 📁 项目结构

```
ai-identity-creator/
├── app/
│   ├── layout.tsx          # 应用布局
│   ├── page.tsx            # 主页
│   └── globals.css         # 全局样式
├── components/
│   ├── IdentitySection.tsx # 身份上传/切换
│   ├── CreationSection.tsx # 创作输入区
│   ├── LocationPanel.tsx   # 位置选择面板
│   ├── IdeasPanel.tsx      # 灵感生成面板
│   ├── ResultsSection.tsx  # 结果展示区
│   ├── StylePanel.tsx      # 风格编辑
│   ├── MotionPanel.tsx     # 动作编辑
│   └── SoundPanel.tsx      # 声音编辑
└── public/                 # 静态资源
```

## 🎨 设计原则

1. **从情感出发，而非控制** - 让用户自然表达，不是工程化提示词
2. **渐进式展示** - 不要一次性展示所有功能，让工具随着创作过程逐步出现
3. **感觉鲜活** - 每个微交互都应该自然流畅
4. **零摩擦迭代** - 从创意到生成再到重制，应该像刷TikTok一样快速

## 🔮 路线图

- [ ] 集成真实的 Gemini API
- [ ] 视频生成功能
- [ ] 用户账户系统
- [ ] 身份库和模板
- [ ] 社区分享功能
- [ ] 高级编辑功能

## 📝 许可证

本项目仅供学习和原型演示使用。

