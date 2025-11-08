import type { Config } from '@vercel/node';
import { VercelRequest, VercelResponse } from '@vercel/node';

export const config: Config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 生成随机 state 用于安全
    const state = Math.random().toString(36).substring(2, 15);

    // 构建 OAuth URL
    const authUrl = new URL('https://connect.linux.do/oauth2/authorize');
    authUrl.searchParams.append('client_id', process.env.CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', process.env.REDIRECT_URI || '');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'user');
    authUrl.searchParams.append('state', state);

    // 返回授权 URL
    res.status(200).json({
      authUrl: authUrl.toString(),
      state,
    });
  } catch (error) {
    console.error('Authorize error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}