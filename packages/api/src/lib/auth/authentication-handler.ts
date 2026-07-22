/**
 * Bootstrap-only session lifecycle. `init()` restores a persisted session on
 * app start — hydrate tokens, then load the current user via `GET /auth/me` —
 * and keeps platform storage in sync with the session store.
 *
 * The `StorageService` is injected because it is platform-specific (web vs
 * native).
 */
import { STORAGE_KEYS } from '@ros/utils';
import { type StorageService } from '@ros/types';

import type { IamApiClient } from '../axios-client/clients/iamApi.client.js';
import { authStore } from './auth-store.js';

export interface AuthenticationHandlerDeps {
  /** The (pure) auth client used to load the current user on boot. */
  iamApiClient: IamApiClient;
  /** Platform storage adapter for durable token persistence. */
  storageService: StorageService;
}

export class AuthenticationHandler {
  constructor(private readonly deps: AuthenticationHandlerDeps) {}

  /**
   * Restore a persisted session on app start, then keep storage in sync.
   *
   * Hydrates tokens from storage and loads the current user via `GET /auth/me`.
   * If either step fails, the session is cleared (no user = logged out).
   * Subscribes so every later token change is persisted. Safe to `await` before
   * rendering auth-dependent routes.
   */
  async init(): Promise<void> {
    const { iamApiClient, storageService } = this.deps;

    const [accessToken, refreshToken] = await Promise.all([
      storageService.getItem(STORAGE_KEYS.accessToken),
      storageService.getItem(STORAGE_KEYS.refreshToken),
    ]);

    if (accessToken && refreshToken) {
      authStore.setState({ accessToken, refreshToken });
      try {
        const { data } = await iamApiClient.getCurrentUser();
        authStore.getState().setUser(data);
      } catch {
        // Couldn't load the user (stale token or failed request) → logged out.
        authStore.getState().clearSession();
      }
    }

    authStore.subscribe((state) => {
      void this.persist(
        this.deps.storageService,
        state.accessToken,
        state.refreshToken,
      );
    });
  }

  /** Mirror the current token pair into (or out of) durable storage. */
  private async persist(
    storage: StorageService,
    accessToken: string | null,
    refreshToken: string | null,
  ): Promise<void> {
    if (accessToken && refreshToken) {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.accessToken, accessToken),
        storage.setItem(STORAGE_KEYS.refreshToken, refreshToken),
      ]);
    } else {
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.accessToken),
        storage.removeItem(STORAGE_KEYS.refreshToken),
      ]);
    }
  }
}
