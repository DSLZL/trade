# Vercel Edge Functions OAuth 安全方案

我已经为你创建了一套安全的 Vercel Edge Functions 来处理 OAuth 认证，避免在前端暴露 `client_secret`。

## 📁 新增文件结构

```
├── api/
│   └── auth/
│       ├── authorize.ts      # 获取授权 URL
│       ├── callback.ts        # OAuth 回调处理（核心安全处理）
│       └── user-info.ts       # 获取用户信息
├── services/
│   └── edgeAuthApi.ts        # API 类型定义
├── hooks/
│   └── useEdgeAuth.ts        # 新的安全认证 Hook
├── components/
│   └── EdgeAuthExample.tsx   # 使用示例
└── vercel-functions.json     # Edge Functions 配置
```

## 🚀 部署步骤

### 1. 在 Vercel 设置环境变量

进入 Vercel Dashboard → 你的项目 → Settings → Environment Variables，添加：

```bash
# 敏感信息（服务端使用）
CLIENT_ID=your_linux_do_client_id
CLIENT_SECRET=your_linux_do_client_secret

# 回调 URL（重要！）
REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback

# 前端 URL
FRONTEND_URL=https://your-domain.vercel.app
```

### 2. 更新 Linux.do OAuth 配置

在 Linux.do 的 OAuth 应用设置中，将回调 URL 更改为：
```
https://your-domain.vercel.app/api/auth/callback
```

### 3. 部署到 Vercel

```bash
git add .
git commit -m "Add secure Edge Functions for OAuth"
git push
```

Vercel 会自动识别 `api/` 文件夹中的函数并部署为 Edge Functions。

## 🔄 如何使用

### 方式一：逐步迁移现有代码

1. **替换认证 Hook**：
   ```typescript
   // 原来的
   import { useAuth } from './hooks/useAuth';

   // 新的（安全的）
   import { useEdgeAuth } from './hooks/useEdgeAuth';
   ```

2. **更新 Header 组件**：
   将 `useAuth()` 替换为 `useEdgeAuth()`

3. **移除前端环境变量**：
   - 删除 `constants.ts` 中的 `VITE_CLIENT_ID` 和 `VITE_CLIENT_SECRET`
   - 现在前端不再需要这些敏感信息

### 方式二：直接测试新方案

使用提供的 `EdgeAuthExample.tsx` 组件：

```tsx
import { EdgeAuthExample } from './components/EdgeAuthExample';

// 在你的 App 组件中使用
function Header() {
  return (
    <div className="header">
      {/* 其他内容 */}
      <EdgeAuthExample />
    </div>
  );
}
```

## 🛡️ 安全性说明

### 改进前
- `CLIENT_SECRET` 暴露在前端代码中
- 任何人都可以在浏览器中查看到你的密钥
- 存在被恶意利用的风险

### 改进后
- `CLIENT_SECRET` 只存在于 Vercel Edge Functions 环境变量中
- 用户永远无法访问到服务端敏感信息
- OAuth 令牌交换在服务器端安全完成

## 📋 Edge Functions 说明

### `/api/auth/authorize`
- **功能**：生成 OAuth 授权 URL
- **方法**：GET
- **返回**：`{ authUrl: string, state: string }`

### `/api/auth/callback` (核心)
- **功能**：处理 OAuth 回调，安全交换令牌
- **方法**：GET
- **处理流程**：
  1. 接收授权码
  2. 在服务器端使用 `client_secret` 交换访问令牌
  3. 通过 JavaScript 消息将令牌传回前端
  4. 关闭弹窗

### `/api/auth/user-info`
- **功能**：获取用户信息
- **方法**：POST
- **请求体**：`{ accessToken: string }`

## 🔄 认证流程

1. 用户点击"登录"
2. 前端调用 `/api/auth/authorize` 获取授权 URL
3. 打开弹窗显示 Linux.do 登录页
4. 用户授权后，回调到 `/api/auth/callback`
5. Edge Functions 在服务端安全处理令牌交换
6. 令牌通过 `window.postMessage` 返回给前端
7. 前端保存认证状态并获取用户信息

## 🚨 注意事项

1. **弹窗支持**：需要浏览器允许弹窗
2. **CORS 设置**：Edge Functions 自动处理 CORS
3. **域名更新**：确保所有 URL 使用正确的域名
4. **测试**：先在测试环境验证流程

## 🔄 回退方案

如果遇到问题，可以快速回退：
1. 删除 `api/` 文件夹
2. 恢复原来的 `constants.ts` 配置
3. 重新使用 `VITE_CLIENT_ID` 和 `VITE_CLIENT_SECRET`

这套方案完全隔离了敏感信息，同时保持了良好的用户体验！