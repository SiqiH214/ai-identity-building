# 安装和运行指南

## 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

## 快速开始

### 1. 安装依赖

```bash
npm install
```

或者使用 yarn:

```bash
yarn install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# OpenAI API Key (可选，用于未来功能)
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Key (必需)
GEMINI_API_KEY=your_gemini_api_key_here
```

**获取 API 密钥：**

- **Gemini API**: 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取免费 API 密钥
- **OpenAI API**: 访问 [OpenAI Platform](https://platform.openai.com/api-keys) 获取 API 密钥

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

## 功能测试

### 基础流程

1. **上传自拍照片**
   - 点击"上传自拍"按钮
   - 选择一张清晰的自拍照（推荐正面照）
   - 照片会显示在左上角

2. **描述场景**
   - 在文本框中输入你想要的场景
   - 例如："我在海边散步"、"在咖啡馆工作"
   - 或点击"获取灵感"查看建议

3. **添加位置（可选）**
   - 点击"添加位置"
   - 从预设位置列表中选择
   - 或使用搜索功能

4. **生成图像**
   - 点击"生成图像"按钮
   - 等待 AI 处理（通常 10-30 秒）
   - 查看生成的 4 张图像

5. **后期编辑**
   - 点击"添加风格"改变图像风格
   - 点击"添加动作"让图像动起来
   - 点击"添加声音"配上背景音

### 当前限制

⚠️ **原型阶段说明**

- 目前使用 mock 数据进行演示
- 真实 Gemini API 集成需要在 `app/api/generate/route.ts` 中完善
- 部分高级功能（视频生成、声音合成）尚未实现

## 开发说明

### 项目结构

```
├── app/                    # Next.js 应用路由
│   ├── api/               # API 路由
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── IdentitySection.tsx
│   ├── CreationSection.tsx
│   └── ...
├── lib/                   # 工具函数和常量
│   ├── api.ts
│   └── constants.ts
└── public/               # 静态资源
```

### 自定义配置

#### 修改预设位置

编辑 `lib/constants.ts` 中的 `LOCATIONS` 数组：

```typescript
export const LOCATIONS = [
  {
    name: '你的位置名称',
    image: '图片URL',
    city: '城市名',
  },
  // ...
]
```

#### 修改风格预设

编辑 `lib/constants.ts` 中的 `STYLE_PRESETS` 数组。

#### 修改灵感建议

编辑 `lib/constants.ts` 中的 `IDEA_CATEGORIES` 数组。

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在环境变量中添加 API 密钥
4. 部署

### 其他平台

项目是标准的 Next.js 应用，可以部署到任何支持 Node.js 的平台：

- Netlify
- AWS Amplify
- Digital Ocean
- 自托管服务器

## 故障排除

### 端口被占用

如果 3000 端口被占用：

```bash
npm run dev -- -p 3001
```

### 依赖安装失败

尝试清除缓存并重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 图像生成失败

1. 检查 `.env.local` 文件中的 API 密钥是否正确
2. 查看浏览器控制台的错误信息
3. 检查网络连接
4. 暂时会回退到 mock 数据

## 获取帮助

如有问题，请：

1. 检查浏览器控制台错误信息
2. 查看终端输出
3. 确保所有依赖正确安装
4. 验证环境变量配置

## 下一步

- 完善 Gemini API 集成
- 添加用户认证系统
- 实现视频生成功能
- 添加更多风格和效果
- 创建社区分享功能

