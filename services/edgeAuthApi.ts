// Edge Functions 的 OAuth 认证服务
// 替代前端直接处理敏感的 client_secret

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface UserInfoResponse {
  id: string;
  username: string;
  avatar_url?: string;
  email?: string;
  // 其他 Linux.do 返回的用户信息字段
}

// API 端点配置
export const API_ENDPOINTS = {
  // 获取授权 URL
  AUTHORIZE: '/api/auth/authorize',
  // OAuth 回调
  CALLBACK: '/api/auth/callback',
  // 获取用户信息
  USER_INFO: '/api/auth/user-info',
} as const;