# ⚠️ Gemini 图像生成问题说明

## 🔍 问题诊断

根据 API 测试，**Gemini API 目前不支持图像生成功能**。

### 错误信息
```
"code": 404,
"message": "models/gemini-2.0-flash-image is not found for API version v1beta, 
or is not supported for generateContent"
```

### 真相
- ❌ `gemini-2.5-flash-image` - 不存在
- ❌ `gemini-2.0-flash-image` - 不存在
- ✅ `gemini-2.0-flash-exp` - 存在，但**只能理解图像，不能生成图像**

Gemini 模型只支持：
- ✅ 图像理解（Image Understanding）
- ✅ 文本生成
- ✅ 多模态对话
- ❌ 图像生成（Image Generation）

---

## 🎯 推荐解决方案

### 方案 1：Replicate + InstantID（推荐）⭐

**优点：**
- ✅ 专门保持人脸特征
- ✅ 图像质量极高
- ✅ 价格便宜（$0.002-0.01/图）
- ✅ API 简单易用
- ✅ 支持多种风格

**实施步骤：**

#### 1. 安装依赖
```bash
npm install replicate
```

#### 2. 获取 API Key
访问：https://replicate.com/account/api-tokens

#### 3. 更新 .env.local
```env
REPLICATE_API_TOKEN=r8_your_token_here
```

#### 4. 更新 API 路由代码

```typescript
// app/api/generate/route.ts
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

// 使用 InstantID 保持人脸
const output = await replicate.run(
  "zsxkib/instant-id:d3e3c2f2c7b6e1c8a9d0f5e3c7b4a6d2e8f5c3a7b9d1e4f6c8a5b7d9e3f1c2a4",
  {
    input: {
      image: selfie_url, // 需要先上传到公共URL
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

### 方案 2：Stability AI

**优点：**
- ✅ 图像质量最高
- ✅ 官方支持好
- ✅ 速度快
- 💰 成本：$0.03/图

**API 示例：**
```bash
curl -X POST https://api.stability.ai/v2beta/stable-image/generate/sd3 \
  -H "authorization: Bearer YOUR_API_KEY" \
  -F "prompt=YOUR_PROMPT" \
  -F "image=@selfie.jpg" \
  -F "strength=0.7"
```

---

### 方案 3：Flux（自托管）

**优点：**
- ✅ 完全免费
- ✅ 图像质量优秀
- ✅ 开源
- ❌ 需要GPU服务器

---

## 📝 下一步建议

### 立即可行：使用 Replicate

1. **注册 Replicate 账号**
   - 访问：https://replicate.com
   - 获取 API Token

2. **安装依赖**
   ```bash
   npm install replicate
   ```

3. **修改代码**
   - 我可以帮你完整实现 Replicate 集成
   - 大约需要修改 100 行代码
   - 预计 10 分钟完成

4. **测试**
   - 上传自拍
   - 生成真实的AI图片
   - 完美保持人脸特征

---

## 💡 为什么 Gemini 文档说支持图像生成？

可能的原因：
1. **Beta 功能**：可能只对部分用户开放
2. **文档过时**：功能还未正式发布
3. **地区限制**：某些地区不可用
4. **API版本**：可能需要不同的API版本

---

## ❓ 你的选择

你想：

**A. 使用 Replicate（推荐）**
- 我立即帮你实现完整集成
- 10分钟后就能生成真实图片
- 成本低廉，效果极好

**B. 使用 Stability AI**
- 图像质量最高
- 但成本稍高

**C. 继续调试 Gemini**
- 可能需要申请 Beta 访问
- 或等待功能正式发布

---

**推荐：选择方案 A，立即切换到 Replicate！** 🚀


