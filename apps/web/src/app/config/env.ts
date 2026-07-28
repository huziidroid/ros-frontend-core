/**
 * Web runtime configuration derived from Vite env vars.
 *
 * Set `VITE_API_BASE_URL` (the backend host, e.g. `https://api.retail-os.com`)
 * in `.env` files; it falls back to the local dev server. The single
 * `ros-be-service` mounts all routes under `/api/v1`.
 */
export const API_HOST: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    '',
  ) ?? 'http://localhost:8000/api/v1';

export const PLATFORM_NAME: string =
  (import.meta.env.VITE_PLATFORM_NAME as string | undefined)?.replace(
    /\/+$/,
    '',
  ) ?? 'Retail OS';
