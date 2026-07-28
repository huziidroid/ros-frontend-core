/** @fileoverview Client for the IAM API. */

import type {
  ApiResponse,
  AuthResult,
  EmailLoginRequestBody,
  EmailSignupRequestBody,
  OtpRequestBody,
  OtpRequestedData,
  OtpVerifyRequestBody,
  RefreshRequestBody,
  TokenPair,
  UserSummary,
} from '@ros/types';

import { RequestHandler } from '../request-handler.js';

/** Client for the IAM API. */
export class IamApiClient extends RequestHandler {
  /** POST /auth/otp/request — send a signup or login verification code. */
  async requestOtp(
    body: OtpRequestBody,
  ): Promise<ApiResponse<OtpRequestedData>> {
    const { data } = await this.requestHandler.post<
      ApiResponse<OtpRequestedData>
    >('otp/request', body);
    return data;
  }

  /** POST /auth/otp/verify — verify a code and complete signup or login. */
  async verifyOtp(
    body: OtpVerifyRequestBody,
  ): Promise<ApiResponse<AuthResult>> {
    const { data } = await this.requestHandler.post<ApiResponse<AuthResult>>(
      'otp/verify',
      body,
    );
    return data;
  }

  /** POST /auth/signup — email + password signup. */
  async emailSignup(
    body: EmailSignupRequestBody,
  ): Promise<ApiResponse<AuthResult>> {
    const { data } = await this.requestHandler.post<ApiResponse<AuthResult>>(
      'signup',
      body,
    );
    return data;
  }

  /** POST /auth/login — email + password login. */
  async emailLogin(
    body: EmailLoginRequestBody,
  ): Promise<ApiResponse<AuthResult>> {
    const { data } = await this.requestHandler.post<ApiResponse<AuthResult>>(
      'login',
      body,
    );
    return data;
  }

  /** POST /auth/refresh — exchange a refresh token for a new pair. */
  async refresh(body: RefreshRequestBody): Promise<ApiResponse<TokenPair>> {
    const { data } = await this.requestHandler.post<ApiResponse<TokenPair>>(
      'refresh',
      body,
    );
    return data;
  }

  /** GET /auth/me — the current authenticated user. */
  async getCurrentUser(): Promise<ApiResponse<UserSummary>> {
    const { data } =
      await this.requestHandler.get<ApiResponse<UserSummary>>('me');
    return data;
  }
}
