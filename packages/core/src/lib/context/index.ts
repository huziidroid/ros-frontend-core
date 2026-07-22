/**
 * App-core React context: the `apiService` (service clients), reactive
 * `accountInfo` (session identity), and app-level services. Components read it
 * via {@link useAppCoreContext} and never import a client directly.
 */
import { createContext, useContext } from 'react';
import type {
  AccountInfo,
  StorageService,
  NavigationService,
  AlertService,
} from '@ros/types';
import { type APIClient } from '@ros/api';

/** Ambient app/experience descriptors carried on the context (and `X-Context`). */
export interface ContextAwareness {
  experience?: string;
  application?: string;
}

export interface IContextState {
  accountInfo: AccountInfo;
  contextAwareness: ContextAwareness | null;
  featureFlags?: Record<string, boolean>;
  storageService: StorageService;
  navigationService: NavigationService;
  alertService: AlertService;
  apiService: APIClient;
}

export const AppCoreContext = createContext<IContextState | null>(null);

/** Read the injected clients + app state from anywhere in the tree. */
export const useAppCoreContext = (): IContextState => {
  const context = useContext(AppCoreContext);
  if (!context) {
    throw new Error('useAppCoreContext must be used within an AppCoreProvider');
  }
  return context;
};
