

export const API_BASE_URL = 'https://api.binance.com';
export const BITCOIN_ID = 'BTCUSDT'; // Symbol for Binance API
export const INITIAL_USD_BALANCE = 100; // Start with $100
export const LOAN_APR = 0.18; // 18% Annual Percentage Rate for loans
export const MAX_LOAN_MULTIPLIER = 10;

// --- OAuth2 Configuration for Linux.do ---
export const OAUTH_CLIENT_ID = process.env.CLIENT_ID;
export const OAUTH_CLIENT_SECRET = process.env.CLIENT_SECRET;
// The redirect URI must match the one registered with your OAuth application.
export const OAUTH_REDIRECT_URI = window.location.origin + '/auth/callback';
export const OAUTH_AUTH_URL = 'https://connect.linux.do/oauth2/authorize';
export const OAUTH_TOKEN_URL = 'https://connect.linux.do/oauth2/token';
export const OAUTH_USER_INFO_URL = 'https://connect.linux.do/oauth2/userinfo';
export const OAUTH_SCOPE = 'user';