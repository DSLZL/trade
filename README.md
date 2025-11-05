# CryptoSim：虚拟比特币交易平台

一个模拟真实比特币（BTC）交易环境的 Web 应用程序。用户可以使用虚拟资金练习买卖 BTC，平台提供实时价格数据和历史趋势图表。

## 主要功能

-   **实时价格数据**：通过币安（Binance）的 WebSocket API 直接获取实时的 BTC/USDT 价格更新。
-   **实时交易 Feed**：实时观察真实的市场交易动态。
-   **交互式图表**：使用 Recharts 可视化多个时间范围（1分钟、30分钟、1小时、12小时、1天、7天、1个月）的历史价格数据。
-   **虚拟交易**：使用 100 美元的初始虚拟资金进行比特币的买卖操作。
-   **动态投资组合**：一个综合仪表盘，用于跟踪您的总投资组合价值、美元余额和比特币持有量。
-   **状态持久化**：您的投资组合和交易历史会自动保存到浏览器的 IndexedDB 中，确保在不同会话之间保留您的进度。
-   **高度安全的用户认证**：通过 OAuth2 与 Linux.do 集成，采用完全在后端处理凭据（使用 Vercel 无服务器函数）的安全流程。`CLIENT_ID` 和 `CLIENT_SECRET` 绝不会暴露给浏览器。
-   **交易历史**：查看所有过去交易的详细列表。
-   **国际化 (i18n)**：完全支持英语和中文（中文），可从头部轻松切换。
-   **响应式界面**：使用 Tailwind CSS 构建的简洁、现代化的界面，可适应任何屏幕尺寸。

## 技术栈

-   **框架**：React
-   **后端**：Vercel Serverless Functions (用于安全的 OAuth 流程)
-   **语言**：TypeScript
-   **样式**：Tailwind CSS
-   **图表**：Recharts
-   **认证**：OAuth 2.0 (Linux.do)
-   **国际化**：i18next
-   **数据源**：币安官方 API (REST & WebSocket)
-   **本地存储**：使用 IndexedDB 进行投资组合持久化

## 本地开发

本项目利用 Vercel CLI 在本地模拟生产环境，包括无服务器函数。

1.  **克隆仓库。**
2.  **安装 Vercel CLI。**
    ```bash
    npm install -g vercel
    ```
3.  **链接项目并拉取环境变量。**
    在项目根目录运行以下命令。您需要创建一个 Vercel 项目并设置环境变量（见下文）才能拉取它们。
    ```bash
    vercel link
    vercel env pull .env.development.local
    ```
    这将在本地创建一个包含您远程环境变量的文件，以便本地服务器可以访问它们。
4.  **启动开发服务器。**
    ```bash
    vercel dev
    ```
    此命令会启动一个本地服务器（通常在 `http://localhost:3000`），该服务器会提供 `public` 目录中的静态文件，并运行 `api` 目录下的无服务器函数。
5.  **打开浏览器并访问 URL。** 您的登录流程现在应该可以在本地正常工作了。

## 部署到 Vercel

本项目已为 Vercel 的零配置部署进行了优化。

1.  **推送您的代码**：将您的代码推送到 GitHub/GitLab/Bitbucket 仓库。
2.  **创建 Vercel 项目**：在 Vercel 上，从您的仓库导入项目。
3.  **配置构建设置**：
    Vercel 会自动检测到这是一个没有前端框架的静态项目，并正确配置构建设置。您 **不需要** 设置构建命令。
    -   **Output Directory**: `public`
    -   **Install Command**: `npm install` (或 `yarn install`，取决于您的偏好)
4.  **添加环境变量**：
    在 Vercel 项目的 `Settings` -> `Environment Variables` 中，添加您的 `CLIENT_ID` 和 `CLIENT_SECRET`。无服务器函数将安全地访问这些变量。
5.  **部署！**
    Vercel 将部署 `public` 目录，并自动发现和部署位于 `/api` 目录下的无服务器函数。

## 认证设置 (OAuth2 with Linux.do)

本应用使用 OAuth2 授权码流程，并通过 Vercel 无服务器函数安全地处理整个流程，以保护您的 `CLIENT_ID` 和 `CLIENT_SECRET`。

### 配置

1.  在 Linux.do 注册一个新的 OAuth 应用程序。
2.  在配置期间，将 **回调地址 (Redirect URI)** 设置为您的部署 URL 加上 `/auth/callback`。
    -   对于本地开发：`http://localhost:3000/auth/callback` (或 Vercel CLI 使用的端口)
    -   对于 Vercel 部署：`https://your-project-name.vercel.app/auth/callback`
3.  获取您的 `Client ID` 和 `Client Secret` 并按照上述说明在 Vercel 中进行配置。

## 项目结构
```
.
├── api/
│   ├── auth/
│   │   ├── login.ts        # 安全构建并返回授权 URL 的函数
│   │   └── callback.ts     # 安全处理 OAuth 令牌交换的函数
├── public/
│   └── index.html          # 应用的入口 HTML 文件
├── components/
│   └── ...
├── hooks/
│   └── ...
├── services/
│   └── ...
├── package.json            # 定义后端依赖项
└── ...
```