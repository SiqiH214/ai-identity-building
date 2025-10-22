# 🎨 图像生成 API 指南

## 当前实现

### 两步生成流程

#### 第 1 步：生成编辑指令
使用 **Gemini 2.0 Flash** 分析自拍和提示词，生成详细的图像编辑指令。

**输入：**
- 用户自拍照片（Base64）
- 文本描述（prompt）
- 可选位置信息

**系统指令：**
```
You are a world-class image editor and professional photographer with over 10 years of experience.
Your task is to generate detailed image editing instructions based on the input selfie and user's description.
Preserve the person's facial identity, proportions, and natural realism.
```

**输出 JSON 格式：**
```json
{
  "editInstructions": "Detailed instructions for transforming the image",
  "imagePrompts": [
    "Prompt 1 for variation 1",
    "Prompt 2 for variation 2",
    "Prompt 3 for variation 3",
    "Prompt 4 for variation 4"
  ]
}
```

#### 第 2 步：生成图像
使用 **Imagen 3** 基于编辑指令和原始自拍生成 4 张变体图像。

**API 端点：**
```
https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict
```

**请求参数：**
```json
{
  "instances": [{
    "prompt": "Generated prompt from step 1",
    "referenceImage": {
      "bytesBase64Encoded": "base64_selfie"
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

## 替代方案

如果 Gemini Imagen 不可用，可以使用以下替代方案：

### 方案 1: Stability AI (Stable Diffusion)

**API:**
```bash
curl -X POST https://api.stability.ai/v2beta/stable-image/generate/sd3 \
  -H "authorization: Bearer YOUR_API_KEY" \
  -H "accept: image/*" \
  -F "prompt=YOUR_PROMPT" \
  -F "image=@selfie.jpg" \
  -F "strength=0.7" \
  -F "output_format=png"
```

**优点：**
- 图像质量高
- 支持人脸保持
- 文档完善

**成本：**
- ~$0.03 per image

### 方案 2: Replicate (多模型)

**API:**
```javascript
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const output = await replicate.run(
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
  {
    input: {
      prompt: "YOUR_PROMPT",
      image: selfie_base64,
      num_outputs: 4
    }
  }
)
```

**优点：**
- 多种模型可选
- 按需付费
- 简单集成

### 方案 3: Flux (开源)

**本地部署或使用 API:**
```python
from diffusers import FluxPipeline

pipe = FluxPipeline.from_pretrained("black-forest-labs/FLUX.1-dev")
images = pipe(
    prompt=prompt,
    image=selfie,
    num_inference_steps=50,
    guidance_scale=7.5
).images
```

**优点：**
- 完全免费（自托管）
- 图像质量优秀
- 开源社区支持

---

## 实施建议

### 推荐方案：Replicate + SDXL

**原因：**
1. ✅ 不需要自己管理 GPU
2. ✅ 按使用量付费
3. ✅ 图像质量好
4. ✅ 支持人脸保持
5. ✅ API 简单易用

### 实施步骤：

#### 1. 安装依赖
```bash
npm install replicate
```

#### 2. 更新 .env.local
```env
REPLICATE_API_TOKEN=your_token_here
```

#### 3. 更新 API 路由
```typescript
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// 使用 InstantID 保持人脸
const output = await replicate.run(
  "zsxkib/instant-id:d3e3c2f2c7b6e1c8a9d0f5e3c7b4a6d2e8f5c3a7b9d1e4f6c8a5b7d9e3f1c2a4",
  {
    input: {
      image: selfie_url,
      prompt: fullPrompt,
      num_outputs: 4,
      guidance_scale: 7.5,
      num_inference_steps: 30,
      ip_adapter_scale: 0.8,
      strength: 0.75
    }
  }
)
```

---

## 当前 Mock 数据

如果所有 API 都失败，应用会使用高质量的 Unsplash 图片作为示例：

```typescript
const mockImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
]
```

---

## API 成本对比

| 服务 | 成本/图 | 质量 | 人脸保持 | 速度 |
|------|---------|------|----------|------|
| Gemini Imagen | TBD | ⭐⭐⭐⭐⭐ | ✅ | 快 |
| Stability AI | $0.03 | ⭐⭐⭐⭐⭐ | ✅ | 快 |
| Replicate SDXL | $0.002 | ⭐⭐⭐⭐ | ✅ | 中 |
| Flux (自托管) | GPU成本 | ⭐⭐⭐⭐⭐ | ✅ | 中 |

---

## 调试技巧

### 查看 API 响应
```bash
# 在浏览器控制台
fetch('/api/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    selfie: 'data:image/jpeg;base64,...',
    prompt: 'walking in the park'
  })
}).then(r => r.json()).then(console.log)
```

### 检查服务器日志
```bash
# 终端会显示
Gemini edit instructions: {...}
Generated prompts: [...]
No images generated, using mock data (如果失败)
```

---

## 下一步

1. **获取 API 密钥**
   - Gemini: https://makersuite.google.com/app/apikey
   - Replicate: https://replicate.com/account/api-tokens
   - Stability AI: https://platform.stability.ai/

2. **选择方案**
   - 原型/演示: 使用 Mock 数据 ✅
   - 小规模: Replicate
   - 大规模: 自托管 Flux
   - 企业: Stability AI

3. **测试和优化**
   - 调整 prompt 格式
   - 优化生成参数
   - 添加缓存机制

---

**当前状态：** 应用已配置好两步生成流程，但需要验证 Imagen 3 API 的可用性。如果不可用，强烈建议切换到 Replicate 方案。

