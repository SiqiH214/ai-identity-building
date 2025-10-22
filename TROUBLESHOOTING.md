# 🔧 故障排除指南

## ⚠️ Watchpack Error: EMFILE (too many open files)

### 问题说明
这是 macOS 系统的文件描述符限制问题，不会影响应用运行，但可能影响热重载功能。

### 快速修复

#### 方法 1：临时修复（当前终端会话有效）

```bash
# 增加文件描述符限制
ulimit -n 10240
```

然后重启服务器：
```bash
npm run dev
```

#### 方法 2：永久修复（推荐）

1. 创建配置文件：
```bash
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

2. 粘贴以下内容：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

3. 加载配置：
```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

4. 重启电脑使配置生效

#### 方法 3：使用 watchman（最佳方案）

```bash
# 安装 watchman（更高效的文件监视工具）
brew install watchman

# 重启服务器
npm run dev
```

---

## 其他常见问题

### 端口被占用

**错误**: `Port 3000 is already in use`

**解决方案**:
```bash
# 方案 1: 使用不同端口
npm run dev -- -p 3001

# 方案 2: 杀死占用端口的进程
lsof -ti:3000 | xargs kill -9
```

### 依赖安装失败

**错误**: `npm install` 报错

**解决方案**:
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 图像生成失败

**问题**: API 调用失败，显示 mock 数据

**检查清单**:
1. 确认 `.env.local` 文件存在
2. 检查 API 密钥是否正确
3. 查看浏览器控制台错误
4. 检查网络连接

**查看 API 密钥**:
```bash
cat .env.local
```

### TypeScript 错误

**错误**: 类型检查失败

**解决方案**:
```bash
# 删除类型缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新构建
npm run dev
```

### 样式不显示

**问题**: Tailwind CSS 样式不生效

**解决方案**:
```bash
# 重新生成 Tailwind 缓存
rm -rf .next
npm run dev
```

---

## 调试技巧

### 查看详细日志

```bash
# 启动时显示详细信息
DEBUG=* npm run dev
```

### 检查环境变量

```bash
# 查看加载的环境变量
node -e "require('dotenv').config({path: '.env.local'}); console.log(process.env)"
```

### 测试 API 连接

在浏览器控制台运行：
```javascript
fetch('/api/generate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    selfie: 'data:image/jpeg;base64,/9j/4AAQ...',
    prompt: '测试'
  })
}).then(r => r.json()).then(console.log)
```

---

## 性能优化

### 如果应用运行缓慢

1. **减少文件监视**:
```bash
# 在 next.config.js 中添加
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  }
}
```

2. **禁用源码映射**（生产环境）:
```bash
# 在 next.config.js 中添加
module.exports = {
  productionBrowserSourceMaps: false,
}
```

---

## 获取帮助

### 1. 查看日志
- **浏览器**: F12 打开开发者工具 → Console
- **服务器**: 查看终端输出

### 2. 检查文档
- `STATUS.md` - 项目状态
- `SETUP.md` - 安装配置
- `HOW_TO_USE.md` - 使用指南

### 3. 常用命令
```bash
# 重启服务器
npm run dev

# 清理并重启
rm -rf .next && npm run dev

# 生产构建测试
npm run build
npm run start
```

---

## 系统要求

### 最低要求
- Node.js 18.x 或更高
- npm 9.x 或更高
- 4GB RAM
- macOS / Linux / Windows

### 推荐配置
- Node.js 20.x
- 8GB RAM
- SSD 硬盘
- 稳定的网络连接

---

## 联系支持

如果问题仍未解决：

1. 📖 查看完整文档
2. 🔍 搜索类似问题
3. 💬 GitHub Issues
4. 📧 联系维护者

---

**记住**: 大多数警告不影响功能，应用能正常运行就可以使用！✨

