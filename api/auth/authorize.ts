import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

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
  return NextResponse.json({
    authUrl: authUrl.toString(),
    state,
  });
}