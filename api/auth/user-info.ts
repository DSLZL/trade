import type { Config } from '@vercel/node';
import { VercelRequest, VercelResponse } from '@vercel/node';

export const config: Config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400).json({ error: 'Access token is required' });
      return;
    }

    const response = await fetch('https://connect.linux.do/oauth2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      res.status(400).json({ error: 'Failed to fetch user info' });
      return;
    }

    const userData = await response.json();

    res.status(200).json(userData);
  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}