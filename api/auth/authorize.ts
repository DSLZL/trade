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

  try {
    // 生成随机 state 用于安全
    const state = crypto.randomUUID();

    // 构建 OAuth URL
    const authUrl = new URL('https://connect.linux.do/oauth2/authorize');
    authUrl.searchParams.append('client_id', process.env.CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', process.env.REDIRECT_URI || '');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'user');
    authUrl.searchParams.append('state', state);

    // 返回授权 URL
    return new Response(JSON.stringify({
      authUrl: authUrl.toString(),
      state,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Authorize error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}