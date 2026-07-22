/**
 * The standard response envelope returned by every `ros-be-service` endpoint.
 *
 * The backend wraps every payload as:
 *   { status_code, status, message, data }
 * (see `app/schemas/response.py`). Transport-layer client methods return this
 * whole envelope; React Query hooks unwrap `.data` for consumers.
 */

/** `status` is derived server-side from the HTTP status code. */
export type ResponseStatus = 'success' | 'error';

/**
 * Generic API response envelope.
 *
 * @typeParam T - Shape of the `data` payload for a given endpoint.
 */
export interface ApiResponse<T> {
  /** Numeric HTTP status the backend assigned (mirrors the transport status). */
  status_code: number;
  /** Success/error flag, derived from `status_code` by the backend. */
  status: ResponseStatus;
  /** Human-readable summary, safe to surface in UI toasts. */
  message: string;
  /** The endpoint payload, or `null` for empty/error responses. */
  data: T | null;
}
