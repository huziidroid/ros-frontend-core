/**
 * `APIClient` facade — the single construction point for service clients.
 *
 * Holds per-service base URLs and shared transport options, and exposes one
 * lazy, cached getter per service. A client is created on first access and
 * throws if its base URL is not configured.
 */
import { IamApiClient } from './clients/iamApi.client.js';

/** per-service base URLs. Add an entry per microservice over time. */
export interface BaseURL {
  iamApiBaseUrl?: string;
}

/**
 * Shared transport options applied to every client. Auth handlers are
 * configured inside {@link RequestHandler}, so they are not passed here.
 */
export interface APIClientOptions {
  contextHeaders?: Record<string, unknown> | null;
  tenantId?: string | null;
  useCredentials?: boolean;
}

export class APIClient {
  private readonly clients: { iamApiClient?: IamApiClient } = {};

  constructor(
    private readonly baseUrl: BaseURL,
    private readonly options: APIClientOptions = {},
  ) {}

  /** Lazily construct + cache the IAM service client. */
  get iamApiClient(): IamApiClient {
    if (!this.baseUrl.iamApiBaseUrl) {
      throw new Error('APIClient: `iamApi` base URL is not configured.');
    }
    if (!this.clients.iamApiClient) {
      this.clients.iamApiClient = new IamApiClient(this.baseUrl.iamApiBaseUrl, {
        tenantId: this.options.tenantId,
        contextHeaders: this.options.contextHeaders,
        contentType: 'application/json',
        useCredentials: this.options.useCredentials,
      });
    }
    return this.clients.iamApiClient;
  }
}
