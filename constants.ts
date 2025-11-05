
// Extend the Window interface to include our custom environment variable
declare global {
  interface Window {
    __APP_ENV__: {
      CLIENT_ID: string;
    };
  }
}

export const API_BASE_URL = 'https://api.binance.com';
export const BITCOIN_ID = 'BTCUSDT'; // Symbol for Binance API
export const INITIAL_USD_BALANCE = 100; // Start with $100

// --- OAuth2 Configuration for Linux.do ---
// CLIENT_ID is now safely injected at runtime from env.js, generated during deployment.
export const OAUTH_CLIENT_ID = window.__APP_ENV__?.CLIENT_ID;

// CLIENT_SECRET is no longer needed on the client. It's used securely on the server.
export const OAUTH_CLIENT_SECRET = undefined;

// The redirect URI must match the one registered with your OAuth application.
export const OAUTH_REDIRECT_URI = window.location.origin + '/auth/callback';
export const OAUTH_AUTH_URL = 'https://connect.linux.do/oauth2/authorize';
export const OAUTH_TOKEN_URL = 'https://connect.linux.do/oauth2/token';
export const OAUTH_USER_INFO_URL = 'https://connect.linux.do/oauth2/userinfo';
export const OAUTH_SCOPE = 'user';