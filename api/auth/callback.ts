export const config = {
  runtime: 'edge',
};

// 统一的 CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  // const state = url.searchParams.get('state'); // state should be validated against a stored value if used for security

  if (!code) {
    return new Response('Authorization code not found', {
      status: 400,
      headers: corsHeaders,
    });
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
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Token exchange error:', errorData);
      return new Response('Failed to exchange token', {
        status: response.status,
        headers: corsHeaders,
      });
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
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_success',
              data: ${JSON.stringify(tokenData)}
            }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
          }
          window.close();
        </script>
        <p>Authentication successful. You can close this window.</p>
      </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
}