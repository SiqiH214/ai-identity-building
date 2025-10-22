# 🎨 Gemini 图像生成配置

## ✅ 当前配置

### 使用的模型
```
gemini-2.5-flash-image
```

这是 Google 最新的支持图像理解和生成的模型。

---

## 🔧 工作流程

### 第 1 步：分析自拍和生成编辑提示

**输入**：
- 用户自拍照片（Base64）
- 用户描述（如："Walking in the park"）
- 可选位置（如："Golden Gate Bridge, SF"）

**系统指令**：
```
You are a world-class image editor and professional photographer with over 10 years of experience.

Generate 4 detailed, professional image editing prompts that transform the input selfie.

CRITICAL REQUIREMENTS:
1. PRESERVE the person's facial identity exactly
2. ONLY change: background, lighting, clothing, pose, environment
3. Each prompt MUST be photorealistic and cinematic
4. Avoid stylization or cartoon effects
```

**输出 JSON**：
```json
{
  "prompts": [
    "Professional photograph of the person from the selfie, walking in Central Park during golden hour...",
    "Professional photograph of the person from the selfie, walking through autumn leaves...",
    "Professional photograph of the person from the selfie, evening walk with city lights...",
    "Professional photograph of the person from the selfie, morning jog in misty park..."
  ]
}
```

### 第 2 步：图像生成

**当前状态**：使用高质量 Mock 图片

**原因**：
- Gemini 2.5 Flash Image 主要用于图像理解和分析
- 实际的图像生成需要 Imagen 3 API
- Imagen 3 可能还未在你的地区完全开放

**解决方案**：
1. **等待 Imagen 3 完全开放**
2. **使用替代方案**（推荐）：
   - Replicate + SDXL
   - Stability AI
   - Flux

---

## 🔑 API 端点

### 当前使用
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent
```

**功能**：
- ✅ 分析图像
- ✅ 理解场景
- ✅ 生成编辑指令
- ❌ 直接生成新图像（需要 Imagen）

### Imagen 3（未来）
```
POST https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
```

**功能**：
- ✅ 图像生成
- ✅ 参考图像
- ✅ 人脸保持
- ⏳ 可能需要白名单访问

---

## 📋 请求格式

### Gemini 2.5 Flash Image

```javascript
{
  "system_instruction": {
    "parts": [{
      "text": "You are a professional photographer..."
    }]
  },
  "contents": [{
    "parts": [
      {
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "base64_selfie_data"
        }
      },
      {
        "text": "User's Description: walking in the park..."
      }
    ]
  }],
  "generationConfig": {
    "temperature": 0.9,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

### Imagen 3（示例）

```javascript
{
  "instances": [{
    "prompt": "Professional photograph of...",
    "referenceImage": {
      "bytesBase64Encoded": "base64_selfie_data"
    },
    "parameters": {
      "sampleCount": 1,
      "aspectRatio": "3:4",
      "personGeneration": "allow_adult",
      "safetySetting": "block_some"
    }
  }]
}
```

---

## 🎯 提示词优化

### 当前策略

每个生成的提示词包含：

1. **前缀**：`"Professional photograph of the person from the selfie,"`
2. **场景描述**：用户的原始提示
3. **摄影参数**：
   - 光线类型（golden hour, natural daylight, etc.）
   - 相机型号（Canon EOS R5, Fujifilm, etc.）
   - 镜头规格（85mm f/1.2, etc.）
   - 质量标签（photorealistic, 8k quality, etc.）

### 示例

**用户输入**：
```
Walking in Central Park
```

**生成的提示词**：
```
Professional photograph of the person from the selfie, 
walking in Central Park during golden hour, 
wearing casual street wear, 
natural sunlight filtering through trees, 
shallow depth of field, 
shot on Canon EOS R5, 85mm f/1.2, 
photorealistic, 8k quality
```

---

## 🔍 调试信息

### 服务器日志

当你上传照片并生成图像时，终端会显示：

```bash
🎨 Using model: gemini-2.5-flash-image
📝 User prompt: Walking in the park
✅ Gemini edit instructions received
📄 Raw response: {"prompts": [...]}
✅ Extracted 4 prompts
🎯 Final prompts generated: 4
ℹ️  Using high-quality mock images (Imagen API not yet available)
💡 See API_GUIDE.md for alternative solutions
```

### 浏览器控制台

打开开发者工具（F12），在 Network 标签可以看到：

```json
{
  "images": [...],
  "prompts": [...],
  "note": "Currently using mock images. See API_GUIDE.md..."
}
```

---

## 🚀 替代方案

### 推荐：Replicate + InstantID

**优点**：
- ✅ 完美的人脸保持
- ✅ 高质量图像生成
- ✅ 按需付费（~$0.002/图）
- ✅ API 简单易用

**安装**：
```bash
npm install replicate
```

**配置**：
```typescript
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

const output = await replicate.run(
  "zsxkib/instant-id",
  {
    input: {
      image: selfie_url,
      prompt: generatedPrompt,
      num_outputs: 4
    }
  }
)
```

**获取 API Token**：
https://replicate.com/account/api-tokens

---

## 📊 成本对比

| 方案 | 启动成本 | 单图成本 | 质量 | 人脸保持 |
|------|---------|---------|------|----------|
| Gemini Mock | $0 | $0 | ⭐⭐⭐ | ❌ |
| Replicate | $0 | $0.002 | ⭐⭐⭐⭐⭐ | ✅ |
| Stability AI | $0 | $0.03 | ⭐⭐⭐⭐⭐ | ✅ |
| Flux (自托管) | GPU租金 | 电费 | ⭐⭐⭐⭐⭐ | ✅ |

---

## 🎯 下一步

### 继续使用 Mock 数据
适合：
- ✅ 原型演示
- ✅ UI/UX 测试
- ✅ 功能展示

### 集成真实 API
推荐顺序：
1. **Replicate** - 最简单，性价比最高
2. **Stability AI** - 企业级质量
3. **等待 Imagen 3** - Google 官方支持

---

## 📞 获取帮助

### 检查 Gemini 可用性
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

### 查看可用模型
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

---

## ✅ 当前状态

**配置完成**：
- ✅ 使用 gemini-2.5-flash-image
- ✅ 智能提示词生成
- ✅ 详细的日志输出
- ✅ 优雅的 Mock 数据降级

**工作正常**：
- ✅ 上传照片
- ✅ 输入描述
- ✅ 生成专业提示词
- ✅ 显示高质量示例图

**待实现**：
- ⏳ 真实图像生成
- ⏳ 人脸保持
- ⏳ 多样性控制

---

**提示**：查看 `API_GUIDE.md` 了解如何集成 Replicate 进行真实图像生成！

