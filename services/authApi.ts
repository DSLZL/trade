// FIX: The OAUTH_CLIENT_ID and OAUTH_REDIRECT_URI constants are no longer exposed to the client
// for security reasons. This import is updated to remove them and the unused
// OAUTH_TOKEN_URL, resolving the module resolution error.
import { OAUTH_USER_INFO_URL } from '../constants';
import { TokenResponse, UserInfoResponse } from '../types';

/**
 * Exchanges an authorization code for an access token by calling our secure serverless function.
 * This function handles the POST request to our own backend, not the OAuth provider.
 * @param code The authorization code received from the OAuth provider.
 * @returns A promise that resolves to the token response.
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  // The client no longer needs the client_secret. It sends the code
  // to our serverless function, which will handle the secret part.
  const response = await fetch('/api/auth/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    // The error message now comes from our own serverless function.
    throw new Error(responseData.error || 'Failed to exchange code for token via backend service.');
  }

  return responseData;
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