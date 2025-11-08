import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return new Response('Authorization code not found', { status: 400 });
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
      return new Response('Failed to exchange token', { status: 400 });
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

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}