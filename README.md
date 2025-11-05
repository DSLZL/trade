# CryptoSim：虚拟比特币交易平台

一个模拟真实比特币（BTC）交易环境的 Web 应用程序。用户可以使用虚拟资金练习买卖 BTC，平台提供实时价格数据和历史趋势图表。

## 主要功能

-   **实时价格数据**：通过币安（Binance）的 WebSocket API 直接获取实时的 BTC/USDT 价格更新。
-   **实时交易 Feed**：实时观察真实的市场交易动态。
-   **交互式图表**：使用 Recharts 可视化多个时间范围（1分钟、30分钟、1小时、12小时、1天、7天、1个月）的历史价格数据。
-   **虚拟交易**：使用 100 美元的初始虚拟资金进行比特币的买卖操作。
-   **动态投资组合**：一个综合仪表盘，用于跟踪您的总投资组合价值、美元余额和比特币持有量。
-   **状态持久化**：您的投资组合和交易历史会自动保存到浏览器的 IndexedDB 中，确保在不同会话之间保留您的进度。
-   **用户认证**：通过 OAuth2 与 Linux.do 集成，实现安全的登录/登出流程，并显示包含用户名和头像的用户个人资料。
-   **交易历史**：查看所有过去交易的详细列表。
-   **国际化 (i18n)**：完全支持英语和中文（中文），可从头部轻松切换。
-   **响应式界面**：使用 Tailwind CSS 构建的简洁、现代化的界面，可适应任何屏幕尺寸。

## 技术栈

-   **框架**：React
-   **语言**：TypeScript
-   **样式**：Tailwind CSS
-   **图表**：Recharts
-   **认证**：OAuth 2.0 (Linux.do)
-   **国际化**：i18next
-   **数据源**：币安官方 API (REST & WebSocket)
-   **本地存储**：使用 IndexedDB 进行投资组合持久化

## 快速开始

本项目采用现代化的、基于 import maps 的免构建开发环境。

1.  **克隆仓库（或下载文件）。**
2.  **配置认证**
    在项目根目录创建一个 `.env` 文件（如果它不存在的话），并添加您的 Linux.do OAuth 应用程序凭据。
    ```
    CLIENT_ID=your_client_id_from_linux_do
    CLIENT_SECRET=your_client_secret_from_linux_do
    ```
3.  **启动项目目录。**
    您需要一个简单的本地 Web 服务器来运行 `index.html` 文件。您可以使用任何静态文件服务器，例如 Python 内置的 `http.server` 模块。
    ```bash
    # 确保您位于项目的根目录
    python -m http.server
    ```
    或者使用像 `serve` 这样的 npm 包：
    ```bash
    npx serve .
    ```
4.  **打开浏览器。**
    访问 `http://localhost:8000` （或您的服务器正在运行的端口）。

这样就可以了！应用程序现在应该已经成功运行。

## 认证设置 (OAuth2 with Linux.do)

本应用使用 OAuth2 授权码流程来认证用户。

### 配置

1.  在 Linux.do 注册一个新的 OAuth 应用程序。
2.  在配置期间，将 **回调地址 (Redirect URI)** 设置为 `http://localhost:8000/auth/callback`（请根据您的本地服务器地址和端口进行调整）。
3.  获取您的 `Client ID` 和 `Client Secret`。
4.  将这些凭据添加到项目根目录的 `.env` 文件中，如“快速开始”部分所示。

### ⚠️ 安全警告

本项目是一个演示项目，为了简化，它在客户端处理 OAuth `client_secret`。**在生产环境中，您绝不能在前端代码中暴露您的 `client_secret`。** 令牌交换过程（使用 `code` 和 `client_secret` 获取 `access_token`）必须由安全的后端服务器（例如，无服务器函数或专用的 API 端点）处理，以保护您的凭据。

## 项目结构

```
.
├── components/
│   ├── ui/               # 可复用的 UI 组件 (按钮, 卡片, 对话框等)
│   ├── AuthCallback.tsx    # 处理 OAuth 回调
│   ├── Dashboard.tsx       # 投资组合摘要
│   ├── ErrorBoundary.tsx   # 捕获 React 渲染错误
│   ├── Header.tsx          # 顶部导航栏，包含认证和语言切换功能
│   ├── LiveTradeFeed.tsx   # 显示实时市场交易
│   ├── PriceChart.tsx      # 交互式历史价格图表
│   ├── PriceChange.tsx     # 显示 24 小时价格变化
│   ├── TradePanel.tsx      # 用于买卖的主要组件
│   └── TransactionHistory.tsx # 用户的历史交易列表
├── hooks/
│   ├── useAuth.ts          # 管理用户认证状态
│   ├── useBitcoinPrice.ts  # 获取并管理所有价格数据 (历史和实时)
│   └── usePortfolio.ts     # 管理用户投资组合状态和交易
├── services/
│   ├── authApi.ts          # 用于处理 OAuth2 认证流程的函数
│   ├── cryptoApi.ts        # 用于从币安 REST API 获取数据的函数
│   └── db.ts               # 用于存储投资组合数据的 IndexedDB 服务
├── lib/
│   └── utils.ts            # 工具函数 (例如用于合并 class 名称的 'cn' 函数)
├── App.tsx                 # 主应用组件，处理路由
├── constants.ts            # 应用全局常量
├── i18n.ts                 # i18next 配置和翻译文件
├── index.html              # 应用的入口 HTML 文件
├── index.tsx               # 渲染 React 应用
├── metadata.json           # 应用元数据
└── types.ts                # TypeScript 类型定义
```