// api/auth/login.ts
// 这个新的无服务器函数用于发起登录流程。
// 它在服务器端构建授权 URL，因此 CLIENT_ID 永远不会暴露给浏览器。

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAUTH_AUTH_URL, OAUTH_SCOPE } from '../../constants';

export default function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // 我们只接受 GET 请求来获取登录 URL。
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const clientId = process.env.CLIENT_ID;

    if (!clientId) {
      console.error("服务器端环境变量 CLIENT_ID 未设置。");
      return res.status(500).json({ error: '服务器配置错误。' });
    }

    // 动态构建 redirect_uri 以适应 Vercel 环境或本地开发。
    // VERCEL_URL 由 Vercel 自动提供。
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'; // FIX: Changed port from 8000 to 3000 for local dev
    const redirectUri = `${host}/auth/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: OAUTH_SCOPE,
    });

    const authorizationUrl = `${OAUTH_AUTH_URL}?${params.toString()}`;

    // 将构建好的 URL 作为 JSON 返回给前端。
    return res.status(200).json({ authorizationUrl });

  } catch (error) {
    console.error('在 /api/auth/login 函数中发生意外错误:', error);
    const errorMessage = error instanceof Error ? error.message : '发生未知错误。';
    return res.status(500).json({ error: '内部服务器错误。', details: errorMessage });
  }
}