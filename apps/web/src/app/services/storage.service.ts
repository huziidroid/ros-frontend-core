/**
 * Web implementation of the platform-agnostic `StorageService` contract.
 *
 * This is the web platform's storage adapter — localStorage-backed and
 * synchronous. The native app supplies its own (AsyncStorage / MMKV) against
 * the same interface, so `@ros/api` never depends on a browser API.
 */
import type { StorageService } from '@ros/types';

export class WebStorageService implements StorageService {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Private mode / disabled storage — behave as if empty.
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota exceeded / disabled storage — ignore.
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  }
}
