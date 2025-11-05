

// 该文件现在只包含对所有环境都通用的、真正的公共常量。

export const API_BASE_URL = 'https://api.binance.com';
export const BITCOIN_ID = 'BTCUSDT'; // Symbol for Binance API
export const INITIAL_USD_BALANCE = 100; // Start with $100

// --- OAuth2 Configuration for Linux.do ---
// 客户端不再需要知道 CLIENT_ID 或 REDIRECT_URI。
// 它们完全在无服务器函数中处理。
export const OAUTH_AUTH_URL = 'https://connect.linux.do/oauth2/authorize';
export const OAUTH_TOKEN_URL = 'https://connect.linux.do/oauth2/token';
export const OAUTH_USER_INFO_URL = 'https://connect.linux.do/oauth2/userinfo';
export const OAUTH_SCOPE = 'user';