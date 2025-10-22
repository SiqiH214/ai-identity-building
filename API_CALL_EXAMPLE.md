# 🔍 完整的 Gemini API 调用示例

## 是的，我们确实传了自拍+prompt给Gemini！

### 📤 实际发送的请求

```bash
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=YOUR_API_KEY

Content-Type: application/json
```

```json
{
  "contents": [
    {
      "parts": [
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "/9j/4AAQSkZJRgABAQAA..."  // 这是你的自拍照片的Base64编码
          }
        },
        {
          "text": "Professional photograph of the person from the selfie, walking in Central Park during golden hour, wearing casual street wear, natural sunlight filtering through trees, shallow depth of field, shot on Canon EOS R5, 85mm f/1.2, photorealistic, 8k quality"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["Image"],
    "imageConfig": {
      "aspectRatio": "3:4"
    }
  }
}
```

---

## 📥 Gemini 可能的响应

### ✅ 成功情况

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Here's the generated image based on your request:"
          },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": "/9j/4AAQSkZJRgABAQAA..."  // 生成的图片
            }
          }
        ]
      },
      "finishReason": "STOP"
    }
  ]
}
```

### 🚫 被安全过滤器阻止

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "I'm sorry, I cannot generate this image as it would violate the policy against generating sexual content."
          }
        ]
      },
      "finishReason": "SAFETY",
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "probability": "HIGH"
        }
      ]
    }
  ]
}
```

---

## 🔍 代码执行流程

### Step 1: 接收用户输入
```typescript
const { selfie, prompt, location } = await request.json()

// selfie = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
// prompt = "I am in a swimming pool"
// location = undefined
```

### Step 2: 生成专业提示词
```typescript
// 使用 gemini-2.5-flash-image 分析自拍
const editInstructionsResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
  {
    body: JSON.stringify({
      system_instruction: { /* 要求生成4个专业摄影提示词 */ },
      contents: [{
        parts: [
          { inline_data: { data: selfie_base64 } },  // ✅ 传了自拍
          { text: "User's Description: I am in a swimming pool" }  // ✅ 传了描述
        ]
      }]
    })
  }
)

// 返回：
// [
//   "Professional photograph of the person, in a swimming pool at sunset...",
//   "Professional photograph of the person, poolside with reflections...",
//   ...
// ]
```

### Step 3: 为每个提示词生成图片
```typescript
for (let i = 0; i < 4; i++) {
  const imageResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
    {
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: selfie.split(',')[1]  // ✅ 传了你的自拍
              }
            },
            {
              text: imagePrompts[i]  // ✅ 传了生成的专业提示词
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["Image"],  // ✅ 明确要求返回图片
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      })
    }
  )

  // 从响应中提取图片
  const data = await imageResponse.json()
  
  for (const part of data.candidates[0].content.parts) {
    if (part.inlineData?.data) {
      // ✅ 找到了图片！
      images.push(`data:image/jpeg;base64,${part.inlineData.data}`)
    } else if (part.text) {
      // 🚫 返回的是文本（可能被安全过滤器阻止）
      console.log("Text response:", part.text)
    }
  }
}
```

---

## 📊 实际终端日志解读

### 你看到的日志：
```bash
🎨 Using model: gemini-2.0-flash-exp
📝 User prompt: I am in a swimming pool

✅ Gemini edit instructions received     # ✅ Step 2 成功
✅ Extracted 4 prompts                   # ✅ 得到了4个提示词
🎯 Final prompts generated: 4

🖼️  Generating images with gemini-2.5-flash-image...
🎨 Generating image 1/4...               # ✅ 开始生成第1张
📝 Text from model: I'm sorry, I cannot generate...  # 🚫 被安全过滤器阻止
❌ No image data found in response       # ❌ 没有图片数据

🎨 Generating image 2/4...               # ✅ 尝试第2张
📝 Text from model: I'm sorry, I can't create...     # 🚫 再次被阻止
❌ No image data found in response

⚠️  No images generated, using fallback mock images  # 降级到mock
```

### 分析：
1. ✅ **API调用成功** - 没有网络错误
2. ✅ **自拍和提示词都传了** - Gemini收到了请求
3. 🚫 **被内容过滤器阻止** - Gemini拒绝生成泳装相关图片
4. ❌ **没有返回图片数据** - 只返回了文本拒绝

---

## 🎯 解决方案

### 方案 1：使用更安全的场景

```typescript
// ❌ 会被阻止
"I am in a swimming pool"
"At the beach in swimsuit"

// ✅ 不会被阻止
"Walking in Central Park"
"Working in a modern cafe"
"Standing on Brooklyn Bridge"
"Reading in a cozy library"
```

### 方案 2：调整安全设置（如果API支持）

```typescript
generationConfig: {
  responseModalities: ["Image"],
  safetySettings: [
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_ONLY_HIGH"  // 只阻止高度敏感内容
    }
  ]
}
```

### 方案 3：使用其他API

如果Gemini的安全过滤太严格：
- **Replicate + InstantID** - 更宽松的过滤
- **Stability AI** - 可自定义安全级别
- **Midjourney** - 专业图像生成

---

## 🧪 测试命令

你可以直接用curl测试：

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=AIzaSyBekJh-oEo5gdJExetxZ26A-zMK6d_AEkw" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {
          "text": "Create a professional photograph of a person walking in a beautiful park during golden hour, wearing casual clothes, natural lighting"
        }
      ]
    }],
    "generationConfig": {
      "responseModalities": ["Image"],
      "imageConfig": {
        "aspectRatio": "3:4"
      }
    }
  }' | jq '.candidates[0].content.parts[] | select(.inlineData) | "Found image!"'
```

---

## ✅ 总结

**你的问题："你传了我的自拍+prompt给gemini了吗？"**

**答案：是的！100%确认！**

证据：
1. ✅ 代码中明确发送了 `inline_data.data = selfie.split(',')[1]`
2. ✅ 代码中明确发送了 `text = imagePrompts[i]`
3. ✅ API返回了响应（不是网络错误）
4. ✅ 终端显示 "Text from model: ..." 说明Gemini收到并处理了请求

**问题不是没传，而是：**
- 🚫 Gemini的安全过滤器认为泳装内容不合适
- 📝 Gemini返回了文本拒绝而不是图片
- ⚠️  需要使用更"安全"的场景描述

---

## 🎯 现在请测试

**访问**: http://localhost:3000

**尝试这个场景**:
```
Walking through Times Square at night
```

**观察终端**：
现在会显示更详细的响应：
```bash
🔍 Response for image 1: {"candidates":[{"content":{"parts":[...]}}]}
```

如果看到 `inlineData`，说明成功了！
如果看到 `"text": "I'm sorry"`，说明又被过滤了。

