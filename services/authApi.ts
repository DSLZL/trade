import { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI, OAUTH_TOKEN_URL, OAUTH_USER_INFO_URL } from '../constants';
import { TokenResponse, UserInfoResponse } from '../types';

/**
 * Exchanges an authorization code for an access token.
 * This function handles the POST request to the token endpoint.
 * @param code The authorization code received from the OAuth provider.
 * @returns A promise that resolves to the token response.
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    throw new Error("OAuth Client ID or Secret is not configured.");
  }

  const params = new URLSearchParams();
  params.append('client_id', OAUTH_CLIENT_ID);
  params.append('client_secret', OAUTH_CLIENT_SECRET);
  params.append('code', code);
  params.append('redirect_uri', OAUTH_REDIRECT_URI);
  params.append('grant_type', 'authorization_code');

  const response = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error', error_description: 'Failed to exchange code for token.' }));
    throw new Error(errorData.error_description || 'Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Fetches user information using a valid access token.
 * @param accessToken The access token obtained from the token exchange.
 * @returns A promise that resolves to the user's profile information.
 */
export async function fetchUserInfo(accessToken: string): Promise<UserInfoResponse> {
  const response = await fetch(OAUTH_USER_INFO_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ error: 'Unknown error', error_description: 'Failed to fetch user info.' }));
    throw new Error(errorData.error_description || 'Failed to fetch user info');
  }

  return response.json();
}
