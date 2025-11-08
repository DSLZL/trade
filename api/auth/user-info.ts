import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response('Access token is required', { status: 400 });
    }

    const response = await fetch('https://connect.linux.do/oauth2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return new Response('Failed to fetch user info', { status: 400 });
    }

    const userData = await response.json();

    return NextResponse.json(userData);
  } catch (error) {
    console.error('User info error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}