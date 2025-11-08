export const config = {
  runtime: 'edge',
};

// 统一的 CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: Request) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Access token is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const response = await fetch('https://connect.linux.do/oauth2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user info' }));
        return new Response(JSON.stringify({ error: errorData.message || 'Failed to fetch user info' }), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
        });
    }

    const userData = await response.json();

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('User info error:', error);
    if (error instanceof SyntaxError) { // Catches JSON parsing errors for empty/invalid body
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
            },
        });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}