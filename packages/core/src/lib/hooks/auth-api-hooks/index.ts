/**
 * Auth domain hooks.
 *
 * Each hook reads the client from {@link useAppCoreContext} and wraps a call to
 * the pure `iamApiClient`. Mutations reconcile the React Query cache and, on
 * success, apply a session-store primitive (`setSession` / `setTokens` /
 * `clearSession`) from `@ros/api` — the client itself has no session side
 * effects.
 */
import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  AuthResult,
  EmailLoginRequestBody,
  EmailSignupRequestBody,
  OtpRequestBody,
  OtpVerifyRequestBody,
  RefreshRequestBody,
} from '@ros/types';
import { clearSession, setSession, setTokens } from '@ros/api';

import { useAppCoreContext } from '../../context/index.js';
import { AppQueryClient } from '../../query-client/index.js';

/** Cache key for the current user (`GET /auth/me`). */
export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const;

/** Persist a successful auth result into both the session store and the cache. */
function cacheAuthResult(result?: AuthResult | null): void {
  if (!result) return;
  setSession({ tokens: result.tokens, user: result.user });
  AppQueryClient.setQueryData(AUTH_ME_QUERY_KEY, result.user);
}

/** GET /auth/me — the current authenticated user. */
export const useGetCurrentUser = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const { apiService } = useAppCoreContext();
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      const res = await apiService.iamApiClient.getCurrentUser();
      return res?.data;
    },
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000,
  });
};

/** POST /auth/otp/request — send a signup or login code. */
export const useRequestOtp = () => {
  const { apiService } = useAppCoreContext();
  return useMutation({
    mutationKey: ['auth', 'request-otp'],
    mutationFn: async (body: OtpRequestBody) =>
      apiService.iamApiClient.requestOtp(body),
    gcTime: 0,
  });
};

/** POST /auth/otp/verify — verify a code, then hydrate the session. */
export const useVerifyOtp = () => {
  const { apiService } = useAppCoreContext();
  return useMutation({
    mutationKey: ['auth', 'verify-otp'],
    mutationFn: async (body: OtpVerifyRequestBody) =>
      apiService.iamApiClient.verifyOtp(body),
    onSuccess: (res) => cacheAuthResult(res?.data),
    gcTime: 0,
  });
};

/** POST /auth/signup — email + password signup, then hydrate the session. */
export const useEmailSignup = () => {
  const { apiService } = useAppCoreContext();
  return useMutation({
    mutationKey: ['auth', 'email-signup'],
    mutationFn: async (body: EmailSignupRequestBody) =>
      apiService.iamApiClient.emailSignup(body),
    onSuccess: (res) => cacheAuthResult(res?.data),
    gcTime: 0,
  });
};

/** POST /auth/login — email + password login, then hydrate the session. */
export const useEmailLogin = () => {
  const { apiService } = useAppCoreContext();
  return useMutation({
    mutationKey: ['auth', 'email-login'],
    mutationFn: async (body: EmailLoginRequestBody) =>
      apiService.iamApiClient.emailLogin(body),
    onSuccess: (res) => cacheAuthResult(res?.data),
    gcTime: 0,
  });
};

/**
 * POST /auth/refresh — manual token refresh. Rarely called directly (the
 * transport layer refreshes on 401); exposed for completeness.
 */
export const useRefreshTokens = () => {
  const { apiService } = useAppCoreContext();
  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: async (body: RefreshRequestBody) =>
      apiService.iamApiClient.refresh(body),
    onSuccess: (res) => {
      if (res?.data) setTokens(res.data);
    },
    gcTime: 0,
  });
};

/** Clear the session store and drop all cached auth state. */
export const useLogout = (): (() => void) =>
  useCallback(() => {
    clearSession();
    AppQueryClient.removeQueries({ queryKey: ['auth'] });
  }, []);
