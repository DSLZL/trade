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

  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    res.status(400).send('Authorization code not found');
    return;
  }

  try {
    const response = await fetch('https://connect.linux.do/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID || '',
        client_secret: process.env.CLIENT_SECRET || '',
        code,
        redirect_uri: process.env.REDIRECT_URI || '',
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Token exchange error:', errorData);
      res.status(400).send('Failed to exchange token');
      return;
    }

    const tokenData = await response.json();

    // 创建一个 HTML 页面，将 token 传递给前端
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Auth Callback</title>
      </head>
      <body>
        <script>
          window.opener.postMessage({
            type: 'oauth_success',
            data: ${JSON.stringify(tokenData)}
          }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');

          window.close();
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Internal server error');
  }
}