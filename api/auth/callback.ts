// This is a Vercel Serverless Function that acts as a secure backend endpoint.
// Vercel automatically maps files in the `/api` directory to endpoints.
// For example, this file becomes the `/api/auth/callback` endpoint.

// Although we are using TypeScript syntax, Vercel can run this.
// We need to define the types for the request and response objects for clarity.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAUTH_TOKEN_URL } from '../../constants';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // We only accept POST requests to this endpoint.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is missing or invalid.' });
    }

    // These environment variables are securely provided by Vercel's infrastructure.
    // They are NEVER exposed to the client.
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Server-side environment variables CLIENT_ID or CLIENT_SECRET are not set.");
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    
    // Dynamically construct the redirect_uri to match the deployment environment.
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'; // FIX: Changed port from 8000 to 3000 for local dev
    const redirectUri = `${host}/auth/callback`;

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    // The serverless function now makes the request to the OAuth provider's token endpoint.
    const tokenResponse = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', tokenData);
      // Forward the error from the auth provider to the client for better debugging.
      return res.status(tokenResponse.status).json({
        error: tokenData.error_description || 'Failed to exchange authorization code for a token.'
      });
    }

    // Send the successful token data (including access_token) back to the client.
    // The client_secret is NOT included in this response.
    return res.status(200).json(tokenData);

  } catch (error) {
    console.error('An unexpected error occurred in the auth callback function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ error: 'An internal server error occurred.', details: errorMessage });
  }
}