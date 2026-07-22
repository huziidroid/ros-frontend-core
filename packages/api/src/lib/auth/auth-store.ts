/**
 * In-memory session store: access/refresh tokens and the current user.
 *
 * A zustand vanilla store, readable synchronously outside React. A non-null
 * `user` means an active session. The exported accessors below are the
 * supported way to read and mutate it.
 */
import { createStore } from 'zustand/vanilla';
import type { TokenPair, UserSummary } from '@ros/types';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserSummary | null;
  /** Replace the whole session (tokens + optional user) after login/signup. */
  setSession(input: { tokens: TokenPair; user?: UserSummary | null }): void;
  /** Replace only the tokens (e.g. after a silent refresh). */
  setTokens(tokens: TokenPair): void;
  /** Set/replace the current user without touching tokens. */
  setUser(user: UserSummary | null): void;
  /** Clear the session on logout or an unrecoverable 401. */
  clearSession(): void;
}

/** The vanilla store instance. Prefer the exported helpers below over this. */
export const authStore = createStore<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setSession: ({ tokens, user }) =>
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      user: user ?? null,
    }),
  setTokens: (tokens) =>
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    }),
  setUser: (user) => set({ user }),
  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
    }),
}));

/* Synchronous accessors over the store. */

/** Current access token, or `null` when there is no session. */
export const getAccessToken = (): string | null =>
  authStore.getState().accessToken;
/** Current refresh token, or `null` when there is no session. */
export const getRefreshToken = (): string | null =>
  authStore.getState().refreshToken;
/** Persist a fresh session (tokens + optional user). */
export const setSession = (input: {
  tokens: TokenPair;
  user?: UserSummary | null;
}): void => authStore.getState().setSession(input);
/** Replace just the tokens (post-refresh). */
export const setTokens = (tokens: TokenPair): void =>
  authStore.getState().setTokens(tokens);
/** Set/replace the current user without touching tokens. */
export const setUser = (user: UserSummary | null): void =>
  authStore.getState().setUser(user);
/** Wipe the session. */
export const clearSession = (): void => authStore.getState().clearSession();
