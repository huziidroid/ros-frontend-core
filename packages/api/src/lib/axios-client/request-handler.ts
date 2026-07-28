/**
 * Abstract transport base class — the only place axios is touched.
 *
 * Owns one axios instance and the shared request/response interceptors: it
 * attaches context/tenant/auth/timezone headers, refreshes the token once on a
 * 401 and retries, and normalizes errors. Service clients extend it and add
 * typed HTTP methods on the protected {@link RequestHandler.requestHandler}.
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  clearSession,
  createTokenRefresher,
  getAccessToken,
  type TokenRefresher,
} from '../auth/index.js';
import { getTimezoneHeaders } from '../utils/index.js';

/** Per-client transport options. */
export interface RequestHandlerOptions {
  tenantId?: string | null;
  contentType?: string;
  useCredentials?: boolean;
  contextHeaders?: Record<string, unknown> | null;
}

/** Shape errors are normalized to before they reach callers. */
export interface NormalizedError {
  status: number;
  data: unknown;
}

export abstract class RequestHandler {
  /** Configured axios instance for use by subclasses. */
  protected readonly requestHandler: AxiosInstance;

  private readonly options: RequestHandlerOptions;
  private readonly contextHeaders?: Record<string, unknown> | null;
  private readonly timezoneHeaders?: Record<string, string>;
  /** Single-flight refresher, configured here from the client's own base URL. */
  private readonly tokenRefresher: TokenRefresher;

  /**
   * @param baseUrl Service base URL, e.g. `${host}/api/v1/`.
   * @param options Transport options (tenant, credentials, context headers).
   */
  constructor(baseUrl: string, options: RequestHandlerOptions = {}) {
    this.options = options;
    this.contextHeaders = options.contextHeaders;
    this.timezoneHeaders = getTimezoneHeaders();
    this.tokenRefresher = createTokenRefresher(baseUrl);

    this.requestHandler = axios.create({ baseURL: baseUrl });
    this.requestHandler.defaults.headers.common['Content-Type'] =
      options.contentType ?? 'application/json';
    this.requestHandler.defaults.responseType = 'json';
    this.requestHandler.defaults.withCredentials =
      options.useCredentials ?? false;

    this.attachRequestInterceptor();
    this.attachResponseInterceptor();
  }

  /** Attach context, tenant, auth, and timezone headers to every request. */
  private attachRequestInterceptor(): void {
    this.requestHandler.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        try {
          if (
            this.contextHeaders &&
            Object.keys(this.contextHeaders).length > 0
          ) {
            config.headers.set(
              'X-Context',
              JSON.stringify(this.contextHeaders),
            );
          }
          if (this.options.tenantId) {
            config.headers.set('X-Tenant-Id', this.options.tenantId);
          }
          const token = getAccessToken();
          if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
          }
          if (this.timezoneHeaders) {
            for (const [key, value] of Object.entries(this.timezoneHeaders)) {
              config.headers.set(key, value);
            }
          }
        } catch (error) {
          // Header assembly must never block a request.
          console.error('[RequestHandler] failed to attach headers', error);
        }
        return config;
      },
    );
  }

  /** Handle 401 refresh-then-retry, then normalize every other error. */
  private attachResponseInterceptor(): void {
    this.requestHandler.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status ?? 0;
        const original = error.config as
          (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (status === 401 && original && !original._retry) {
          original._retry = true;

          const newToken = await this.tokenRefresher();
          if (newToken) {
            original.headers.set('Authorization', `Bearer ${newToken}`);
            return this.requestHandler(original);
          }
          // Refresh failed → clear the session. The now-null user lets the
          // app's route guards redirect to login.
          clearSession();
        }

        const normalized: NormalizedError = {
          status,
          data: error.response?.data ?? null,
        };
        console.error('[RequestHandler] request failed', normalized);
        return Promise.reject(normalized);
      },
    );
  }
}
