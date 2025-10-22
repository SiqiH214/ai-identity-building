# 📂 项目结构详解

## 完整目录树

```
ai-identity-creator/
│
├── 📱 app/                         # Next.js App Router
│   ├── api/                       # API 路由
│   │   └── generate/              # 图像生成接口
│   │       └── route.ts           # POST /api/generate
│   ├── layout.tsx                 # 根布局（HTML结构）
│   ├── page.tsx                   # 主页面（入口组件）
│   └── globals.css                # 全局样式和 Tailwind 指令
│
├── 🧩 components/                  # React 组件库
│   ├── IdentitySection.tsx        # 身份管理区
│   ├── CreationSection.tsx        # 创作输入区
│   ├── LocationPanel.tsx          # 位置选择面板
│   ├── IdeasPanel.tsx             # 灵感生成面板
│   ├── ResultsSection.tsx         # 结果展示区
│   ├── StylePanel.tsx             # 风格编辑面板
│   ├── MotionPanel.tsx            # 动作编辑面板
│   └── SoundPanel.tsx             # 声音编辑面板
│
├── 🛠️ lib/                         # 工具函数和常量
│   ├── api.ts                     # API 客户端函数
│   └── constants.ts               # 应用常量（位置、风格等）
│
├── 🔧 scripts/                     # 脚本工具
│   └── setup.sh                   # 快速安装脚本
│
├── 📖 文档文件
│   ├── README.md                  # 项目主文档
│   ├── SETUP.md                   # 详细安装指南
│   ├── QUICKSTART.md              # 快速开始
│   ├── PROJECT_OVERVIEW.md        # 项目架构概览
│   ├── PROJECT_SUMMARY.md         # 项目交付总结
│   ├── STRUCTURE.md               # 项目结构（本文件）
│   ├── FEATURES.md                # 功能列表
│   ├── CONTRIBUTING.md            # 贡献指南
│   └── LICENSE                    # MIT 开源协议
│
├── ⚙️ 配置文件
│   ├── package.json               # npm 依赖和脚本
│   ├── tsconfig.json              # TypeScript 配置
│   ├── tailwind.config.js         # Tailwind CSS 配置
│   ├── next.config.js             # Next.js 配置
│   ├── postcss.config.js          # PostCSS 配置
│   ├── next-env.d.ts              # Next.js 类型定义
│   ├── .gitignore                 # Git 忽略规则
│   └── .cursorrules               # Cursor 开发规则
│
└── 🔐 环境变量（需自行创建）
    └── .env.local                 # API 密钥配置
```

---

## 📁 文件夹详解

### 1. `app/` - 应用核心

Next.js 14 的 App Router 结构。

#### `app/layout.tsx`
- 🎯 **作用**: 根布局组件
- 📝 **内容**: HTML 结构、meta 标签、字体加载
- 🔗 **依赖**: globals.css

#### `app/page.tsx`
- 🎯 **作用**: 主页面组件
- 📝 **内容**: 应用主要逻辑、状态管理、API 调用
- 🔗 **依赖**: 所有 components

#### `app/globals.css`
- 🎯 **作用**: 全局样式定义
- 📝 **内容**: Tailwind 指令、自定义类、CSS 变量
- 🔗 **依赖**: Tailwind CSS

#### `app/api/generate/route.ts`
- 🎯 **作用**: 图像生成 API 端点
- 📝 **内容**: POST 请求处理、Gemini API 调用、错误处理
- 🔗 **依赖**: Gemini API

---

### 2. `components/` - UI 组件

所有 React 组件，按功能区域组织。

#### 组件关系图

```
┌─────────────────────────────────────────────┐
│              app/page.tsx                   │
│          (主页面 - 状态管理)                 │
└────────┬────────────────────────┬───────────┘
         │                        │
    ┌────▼─────┐           ┌──────▼──────┐
    │ Identity │           │  Creation   │
    │ Section  │           │   Section   │
    └──────────┘           └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼────┐  ┌────▼─────┐ ┌────▼─────┐
              │ Location │  │  Ideas   │ │ Results  │
              │  Panel   │  │  Panel   │ │ Section  │
              └──────────┘  └──────────┘ └────┬─────┘
                                              │
                                 ┌────────────┼────────────┐
                                 │            │            │
                            ┌────▼───┐  ┌────▼────┐  ┌───▼────┐
                            │ Style  │  │ Motion  │  │ Sound  │
                            │ Panel  │  │ Panel   │  │ Panel  │
                            └────────┘  └─────────┘  └────────┘
```

#### 各组件详解

**IdentitySection.tsx** (370 行)
- 功能: 自拍上传、身份切换
- 状态: 文件选择、下拉菜单
- 动画: 头像淡入、下拉滑动

**CreationSection.tsx** (180 行)
- 功能: 文本输入、建议、生成触发
- 状态: 提示词、位置、面板显示
- 动画: 建议淡入、按钮脉冲

**LocationPanel.tsx** (150 行)
- 功能: 位置选择、搜索
- 数据: 从 constants.ts 导入
- 动画: 侧边滑入、卡片淡入

**IdeasPanel.tsx** (140 行)
- 功能: 灵感建议、场景选择
- 数据: 从 constants.ts 导入
- 动画: 底部滑出、卡片逐个显示

**ResultsSection.tsx** (200 行)
- 功能: 图片展示、下载、编辑入口
- 状态: 选中图片、编辑面板
- 动画: 网格布局、悬停效果

**StylePanel.tsx** (120 行)
- 功能: 风格预设选择
- 数据: 6 种风格
- 动画: 底部滑出

**MotionPanel.tsx** (160 行)
- 功能: 动作选择、强度调节
- 数据: 5 种动作
- 动画: 居中弹出

**SoundPanel.tsx** (140 行)
- 功能: 声音选择、音量控制
- 数据: 5 种环境音
- 动画: 居中弹出

---

### 3. `lib/` - 工具库

共享的函数和常量。

#### `lib/api.ts`
```typescript
// 导出的函数
export async function generateImages()
export function downloadImage()
export function fileToBase64()
```

#### `lib/constants.ts`
```typescript
// 导出的常量
export const LOCATIONS = [...]          // 7 个位置
export const STYLE_PRESETS = [...]      // 6 种风格
export const IDEA_CATEGORIES = [...]    // 4 个分类
export const MOTION_TYPES = [...]       // 5 种动作
export const SOUND_TYPES = [...]        // 5 种声音
```

---

## 🔄 数据流向

### 主要数据流

```
┌─────────────┐
│   用户操作   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  app/page   │ ← 状态中心
│  (useState) │
└──────┬──────┘
       │
       ├──► identityImage ──► IdentitySection
       ├──► prompt ──────────► CreationSection
       ├──► location ────────► CreationSection
       ├──► isGenerating ────► CreationSection
       └──► generatedImages ─► ResultsSection
```

### API 调用流程

```
用户点击"生成"
    │
    ▼
app/page.tsx
handleGenerate()
    │
    ▼
lib/api.ts
generateImages()
    │
    ▼
fetch /api/generate
    │
    ▼
app/api/generate/route.ts
POST handler
    │
    ├──► Gemini API
    │    (成功) ──► 返回图像
    │
    └──► (失败) ──► Mock 数据
```

---

## 🎨 样式架构

### Tailwind CSS 结构

```
globals.css
├── @tailwind base
│   └── 基础重置
│
├── @tailwind components
│   ├── .glass-panel      # 毛玻璃面板
│   ├── .btn-primary      # 主要按钮
│   ├── .btn-secondary    # 次要按钮
│   └── .input-field      # 输入框
│
└── @tailwind utilities
    └── 工具类
```

### 自定义配置

**tailwind.config.js**
- 颜色: warm-gray 调色板
- 动画: fadeIn, slideUp, pulseSoft
- 断点: 默认（sm/md/lg/xl/2xl）

---

## 🔧 配置文件详解

### `package.json`
```json
{
  "scripts": {
    "dev": "开发服务器",
    "build": "生产构建",
    "start": "启动生产服务器",
    "lint": "代码检查"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "framer-motion": "10.16.4",
    ...
  }
}
```

### `tsconfig.json`
- strict: true (严格模式)
- paths: @/* 别名
- jsx: preserve (Next.js 处理)

### `tailwind.config.js`
- content: 扫描文件路径
- theme.extend: 自定义主题
- plugins: 插件列表

### `next.config.js`
- images.domains: 图片域名白名单
- reactStrictMode: true

---

## 📊 代码统计

### 按文件类型

```
TypeScript (.ts/.tsx)
├── 组件        ~1,800 行
├── API         ~150 行
├── 工具        ~200 行
└── 配置        ~200 行
    总计: ~2,350 行

CSS (.css)
└── 全局样式    ~150 行

文档 (.md)
└── 8 个文件    ~3,000 行
```

### 按功能模块

```
身份管理: ~370 行
创作输入: ~470 行
结果展示: ~460 行
后期编辑: ~420 行
工具/API: ~350 行
配置文件: ~200 行
```

---

## 🚀 构建产物

### 开发模式
```
npm run dev
├── .next/
│   ├── cache/          # 缓存
│   ├── server/         # 服务端代码
│   └── static/         # 静态资源
```

### 生产模式
```
npm run build
├── .next/
│   ├── static/         # 静态资源 (CDN)
│   ├── server/         # 服务端渲染
│   └── standalone/     # 独立部署
```

---

## 🔍 文件查找指南

### 我想修改...

**UI 样式**
→ 查看 `app/globals.css` 或组件内的 className

**预设数据**
→ 查看 `lib/constants.ts`

**API 逻辑**
→ 查看 `app/api/generate/route.ts`

**组件逻辑**
→ 查看 `components/` 对应文件

**配置**
→ 查看根目录配置文件

**文档**
→ 查看根目录 `.md` 文件

---

## 📝 命名规范

### 文件命名
- 组件: PascalCase.tsx (如 IdentitySection.tsx)
- 工具: camelCase.ts (如 api.ts)
- 配置: kebab-case.js (如 next.config.js)

### 变量命名
- 组件: PascalCase
- 函数: camelCase
- 常量: UPPER_SNAKE_CASE
- Props: camelCase

### CSS 类名
- Tailwind: 使用工具类
- 自定义: kebab-case (如 glass-panel)

---

## 🎯 快速定位

### 常见任务

**添加新位置**
→ `lib/constants.ts` → LOCATIONS

**修改风格**
→ `lib/constants.ts` → STYLE_PRESETS

**调整动画**
→ `tailwind.config.js` → theme.extend.animation

**修改 API**
→ `app/api/generate/route.ts`

**修改主页逻辑**
→ `app/page.tsx`

**添加新组件**
→ `components/YourComponent.tsx`

---

## 🔗 依赖关系

### 核心依赖

```
Next.js (框架)
├── React (UI库)
├── TypeScript (类型系统)
└── PostCSS (CSS处理)
    └── Tailwind CSS (样式)
        └── Autoprefixer

Framer Motion (动画)
Lucide React (图标)
```

### 开发依赖

```
@types/* (类型定义)
ESLint (代码检查)
```

---

**这就是整个项目的结构！** 🎉

如需详细了解某个模块，请查看相应的源代码文件。

