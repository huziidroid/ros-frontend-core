/**
 * Builds a single-flight access-token refresher.
 *
 * Reads the refresh token from the session store, exchanges it for a new pair,
 * and writes the result back — or clears the session on failure. Uses a bare
 * axios call (never a {@link RequestHandler}) so a refresh can't recurse
 * through the 401 interceptor. Concurrent 401s share one in-flight request.
 */
import axios from 'axios';
import type { ApiResponse, TokenPair } from '@ros/types';

import {
  clearSession,
  getRefreshToken,
  setTokens,
} from '../auth/auth-store.js';

/** Returns a new access token, or `null` if the session can't be recovered. */
export type TokenRefresher = () => Promise<string | null>;

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Build a {@link TokenRefresher} bound to the auth service base URL
 * (e.g. `${host}/api/v1/auth`, the same base the {@link IamApiClient} uses).
 * Reads the refresh token from the auth store; on success the new pair is
 * written back via `setTokens`; on any failure the session is cleared and
 * `null` is returned.
 */
export function createTokenRefresher(authBaseUrl: string): TokenRefresher {
  let inFlight: Promise<string | null> | null = null;

  return () => {
    if (inFlight) return inFlight;

    inFlight = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearSession();
        return null;
      }
      try {
        const { data } = await axios.post<ApiResponse<TokenPair>>(
          joinUrl(authBaseUrl, 'refresh'),
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const tokens = data?.data;
        if (!tokens?.access_token) {
          clearSession();
          return null;
        }
        setTokens(tokens);
        return tokens.access_token;
      } catch {
        clearSession();
        return null;
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  };
}
