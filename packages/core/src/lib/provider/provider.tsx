/**
 * Core provider tree.
 *
 * Given a `baseUrl` and the platform `storageService`, this builds the single
 * {@link APIClient} facade (all service clients), boots the session via the
 * init-only {@link AuthenticationHandler}, and publishes `apiService` +
 * `accountInfo` on {@link AppCoreContext}. The handler is constructed and
 * `init()`-ed here and then dropped — it is never exposed to consumers.
 *
 * Consumers read only `apiService` (clients) and `accountInfo` (reactive
 * session identity); session writes happen through the auth hooks, not here.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { APIClient, AuthenticationHandler, authStore } from '@ros/api';
import { useStore } from 'zustand';

import { AppCoreContext, IContextState } from '../context/index.js';
import { AppQueryClient } from '../query-client/index.js';

export interface AppCoreProviderProps extends Omit<
  IContextState,
  'apiService' | 'accountInfo'
> {
  children: ReactNode;
  baseUrl: string;
}

export function AppCoreProvider({
  children,
  baseUrl,
  storageService,
  navigationService,
  contextAwareness,
  ...rest
}: AppCoreProviderProps) {
  // Normalize to a single trailing-slash-free host, then derive per-service URLs.
  const normalizedBaseUrl = useMemo(
    () => baseUrl.replace(/\/+$/, ''),
    [baseUrl],
  );
  const iamApiBaseUrl = useMemo(
    () => `${normalizedBaseUrl}/auth`,
    [normalizedBaseUrl],
  );

  const apiService = useMemo(
    () =>
      new APIClient(
        { iamApiBaseUrl },
        {
          contextHeaders: contextAwareness as Record<string, string>,
          useCredentials: false,
        },
      ),
    [iamApiBaseUrl],
  );

  // Bootstrap-only. Constructed + init'd here, never placed on the context.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const handler = new AuthenticationHandler({
      iamApiClient: apiService.iamApiClient,
      storageService: storageService,
    });
    let active = true;
    handler.init().finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [apiService, storageService]);

  // Reactive session identity. A non-null user means an active session.
  const user = useStore(authStore, (s) => s.user);
  const accountInfo = useMemo(() => ({ user }), [user]);

  const value: IContextState = useMemo(
    () => ({
      ...rest,
      apiService,
      accountInfo,
      storageService,
      navigationService,
      contextAwareness,
    }),
    [
      rest,
      apiService,
      accountInfo,
      storageService,
      navigationService,
      contextAwareness,
    ],
  );

  // Gate first render until the session has been restored.
  if (!ready) {
    return null;
  }

  return (
    <AppCoreContext.Provider value={value}>
      <QueryClientProvider client={AppQueryClient}>
        {children}
      </QueryClientProvider>
    </AppCoreContext.Provider>
  );
}
