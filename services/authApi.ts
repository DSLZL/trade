import { OAUTH_USER_INFO_URL } from '../constants';
import { TokenResponse, UserInfoResponse } from '../types';

/**
 * Exchanges an authorization code for an access token by calling our secure backend endpoint.
 * This function no longer handles credentials directly.
 * @param code The authorization code received from the OAuth provider.
 * @returns A promise that resolves to the token response from our backend.
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const response = await fetch('/api/auth/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ details: 'Failed to exchange code for token via backend.' }));
    throw new Error(errorData.details || 'An unknown error occurred during token exchange.');
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