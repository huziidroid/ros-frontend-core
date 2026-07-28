/**
 * Auth domain types.
 *
 * These mirror the Pydantic schemas in `ros-be-service`:
 *   - app/schemas/auth/__init__.py  (TokenPair, UserSummary, AuthResult)
 *   - app/schemas/auth/email.py     (email signup / login / refresh bodies)
 *   - app/schemas/auth/otp.py       (OTP request / verify bodies)
 *
 * Field names are kept snake_case to match the wire format exactly, so no
 * request/response remapping is needed in the transport layer.
 */

/** Access + refresh JWT pair returned by every signup/login endpoint. */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** The authenticated user's summary. `tenant_id` is encoded in the JWT too. */
export interface UserSummary {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
}

/** Payload of a successful signup or login: the user plus their tokens. */
export interface AuthResult {
  user: UserSummary;
  tokens: TokenPair;
}

/** POST /auth/signup — email + password signup. */
export interface EmailSignupRequestBody {
  business_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

/** POST /auth/login — email + password login. */
export interface EmailLoginRequestBody {
  email: string;
  password: string;
}

/** POST /auth/refresh — exchange a refresh token for a new pair. */
export interface RefreshRequestBody {
  refresh_token: string;
}

/**
 * POST /auth/otp/request — send a signup or login code.
 *
 * `business_name` / `first_name` / `last_name` are only required the first
 * time a phone number is seen (signup); omit them for a returning number.
 */
export interface OtpRequestBody {
  phone_number: string;
  business_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

/** POST /auth/otp/verify — verify a code and complete signup or login. */
export interface OtpVerifyRequestBody {
  phone_number: string;
  code: string;
}

/** Payload returned when an OTP has been dispatched. */
export interface OtpRequestedData {
  phone_number: string;
  expires_in_seconds: number;
}

/** The current session identity. `null` user means no active session. */
export interface AccountInfo {
  user: UserSummary | null;
}
