export interface StorageService {
  /** Read a value. Resolves to `null` when the key is absent. */
  getItem(key: string): string | null | Promise<string | null>;
  /** Write a value. */
  setItem(key: string, value: string): void | Promise<void>;
  /** Delete a value. */
  removeItem(key: string): void | Promise<void>;
}
