// /api/auth/callback.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAUTH_TOKEN_URL } from '../../constants';
import { TokenResponse } from '../../types';

// This function runs on the server, not in the browser.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is missing or invalid.' });
  }

  const { CLIENT_ID, CLIENT_SECRET } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Server-side environment variables CLIENT_ID or CLIENT_SECRET are not set.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // The redirect URI must be determined dynamically based on the deployment environment.
  // Vercel provides VERCEL_URL which includes the deployment URL.
  // For local development, we default to localhost:8000 (adjust if needed).
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'http';
  const redirectUri = `${protocol}://${host}/auth/callback`;

  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const tokenData: TokenResponse | { error: string; error_description: string } = await tokenResponse.json();

    if (!tokenResponse.ok) {
      const errorDescription = 'error_description' in tokenData ? tokenData.error_description : 'Failed to exchange code for token';
      throw new Error(errorDescription);
    }
    
    // Send the token data back to the client
    res.status(200).json(tokenData);

  } catch (error: any) {
    console.error('Error during token exchange:', error);
    res.status(500).json({ error: 'Authentication failed.', details: error.message });
  }
}