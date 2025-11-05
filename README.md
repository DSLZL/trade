# CryptoSim：虚拟比特币交易平台

一个模拟真实比特币（BTC）交易环境的 Web 应用程序。用户可以使用虚拟资金练习买卖 BTC，平台提供实时价格数据和历史趋势图表。

## 主要功能

-   **实时价格数据**：通过币安（Binance）的 WebSocket API 直接获取实时的 BTC/USDT 价格更新。
-   **实时交易 Feed**：实时观察真实的市场交易动态。
-   **交互式图表**：使用 Recharts 可视化多个时间范围（1分钟、30分钟、1小时、12小时、1天、7天、1个月）的历史价格数据。
-   **虚拟交易**：使用 100 美元的初始虚拟资金进行比特币的买卖操作。
-   **动态投资组合**：一个综合仪表盘，用于跟踪您的总投资组合价值、美元余额和比特币持有量。
-   **状态持久化**：您的投资组合和交易历史会自动保存到浏览器的 IndexedDB 中，确保在不同会话之间保留您的进度。
-   **安全的用户认证**：通过 OAuth2 与 Linux.do 集成，采用安全的、仅限后端的令牌交换流程。包含用户名和头像的用户个人资料会安全显示。
-   **交易历史**：查看所有过去交易的详细列表。
-   **国际化 (i18n)**：完全支持英语和中文（中文），可从头部轻松切换。
-   **响应式界面**：使用 Tailwind CSS 构建的简洁、现代化的界面，可适应任何屏幕尺寸。

## 技术栈

-   **框架**：React
-   **后端**：Vercel 无服务器函数 (Serverless Functions)
-   **语言**：TypeScript
-   **样式**：Tailwind CSS
-   **图表**：Recharts
-   **认证**：OAuth 2.0 (Linux.do) - **安全的后端流程**
-   **国际化**：i18next
-   **数据源**：币安官方 API (REST & WebSocket)
-   **本地存储**：使用 IndexedDB 进行投资组合持久化

## 部署到 Vercel (推荐)

这是部署此应用的最简单、最安全的方式。

1.  **Fork 仓库**
    将此仓库 Fork 到您自己的 GitHub 账户。

2.  **在 Vercel 上创建新项目**
    -   登录到您的 [Vercel](https://vercel.com) 账户。
    -   点击 "Add New... -> Project"。
    -   从您的 GitHub 账户导入您刚刚 Fork 的仓库。

3.  **配置环境变量**
    在项目设置的 "Environment Variables" 部分，添加以下两个变量。这些变量将安全地提供给后端的无服务器函数。
    -   `CLIENT_ID`: 您从 Linux.do OAuth 应用程序获得的 Client ID。
    -   `CLIENT_SECRET`: 您从 Linux.do OAuth 应用程序获得的 Client Secret。

4.  **检查构建设置**
    Vercel 通常会自动检测项目类型。由于我们有 `package.json`，它可能会尝试应用 Node.js 预设。请确保设置如下：
    -   **Framework Preset**: `Other`
    -   **Build Command**: `node generate-env.js`
    -   **Output Directory**: `public` (或者如果您的 `index.html` 在根目录，则保留为空)

5.  **部署**
    点击 "Deploy"。Vercel 将构建并部署您的应用。部署完成后，访问 Vercel 提供的 URL。

6.  **更新 OAuth 回调地址**
    -   回到您在 Linux.do 上的 OAuth 应用程序设置。
    -   将 **回调地址 (Redirect URI)** 更新为您 Vercel 应用的 URL，并附加上 `/auth/callback`。例如：`https://your-app-name.vercel.app/auth/callback`。

## 本地开发

由于认证流程现在依赖于 Node.js 后端（无服务器函数），您需要使用 Vercel CLI 在本地运行整个环境。

1.  **安装 Vercel CLI**
    ```bash
    npm install -g vercel
    ```

2.  **克隆仓库并安装依赖**
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    npm install
    ```

3.  **创建本地环境变量文件**
    在项目根目录创建一个名为 `.env` 的文件，并填入您的凭据：
    ```
    CLIENT_ID=your_client_id_from_linux_do
    CLIENT_SECRET=your_client_secret_from_linux_do
    ```

4.  **更新 OAuth 回调地址**
    为了进行本地测试，请确保您在 Linux.do 的 OAuth 应用程序设置中添加了本地回调地址。Vercel CLI 通常在 `http://localhost:3000` 上运行。
    -   添加 `http://localhost:3000/auth/callback` 到您允许的回调地址列表中。

5.  **启动开发服务器**
    在项目根目录运行以下命令：
    ```bash
    vercel dev
    ```
    此命令会同时启动静态文件服务和模拟的无服务器函数环境，使 `api/auth/callback.ts` 可以在本地工作。

6.  **打开浏览器**
    访问 `http://localhost:3000`。

## 项目结构

```
.
├── api/                  # Vercel 无服务器函数 (后端逻辑)
│   └── auth/
│       └── callback.ts   # 安全处理 OAuth 令牌交换
├── components/
│   └── ... (UI 组件)
├── hooks/
│   └── ... (React Hooks)
├── public/
│   ├── env.template.js   # 客户端环境变量的模板
│   └── env.js            # 在构建时生成，对前端安全地暴露 CLIENT_ID
├── services/
│   └── ... (API 服务)
├── App.tsx
├── constants.ts
├── generate-env.js       # 在部署时生成 env.js 的脚本
├── i18n.ts
├── index.html
├── index.tsx
├── package.json          # 项目依赖和脚本
├── types.ts
└── vercel.json           # Vercel 部署配置
```