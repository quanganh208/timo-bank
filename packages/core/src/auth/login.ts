import { HttpClient } from '../http/client.js';
import { buildAuthHeaders, buildContextId } from '../http/headers.js';
import { API_CODES } from '../utils/constants.js';
import { AuthError, SessionExpiredError, DeviceInvalidatedError } from '../errors/classes.js';
import type { ApiResponse, LoginResponseData } from '../types/api.js';

/**
 * Session data after successful login
 */
export interface SessionData {
  token: string;
  userId: string;
  phoneNumber: string;
  timoDeviceId: string;
  contextId: string;
}

/**
 * OTP requirement response
 */
export interface OtpRequirement {
  type: 'device' | 'twoFactor';
  refNo: string;
  token: string;
}

/**
 * Login result - either success or OTP required
 */
export type LoginResult =
  | { success: true; session: SessionData }
  | { success: false; otpRequired: OtpRequirement };

/**
 * Login manager for handling authentication flow
 */
export class LoginManager {
  private readonly httpClient: HttpClient;
  private readonly deviceId: string;
  private readonly browserSignature: string;
  private readonly contextId: string;

  constructor(
    deviceId: string,
    browserSignature: string,
    httpClient: HttpClient = new HttpClient()
  ) {
    this.deviceId = deviceId;
    this.browserSignature = browserSignature;
    this.httpClient = httpClient;
    this.contextId = buildContextId(deviceId);
  }

  /**
   * Perform initial login
   * @param username - Phone number
   * @param password - Pre-hashed password (SHA512)
   */
  async login(username: string, password: string): Promise<LoginResult> {
    const authHeaders = buildAuthHeaders(this.deviceId, this.browserSignature);

    const response = await this.httpClient.post<LoginResponseData>(
      '/login',
      {
        username,
        password,
        lang: 'vn',
      },
      { headers: authHeaders }
    );

    return this.handleLoginResponse(response);
  }

  /**
   * Verify device OTP (code 6001)
   */
  async verifyDeviceOtp(otp: string, refNo: string, token: string): Promise<SessionData> {
    const response = await this.httpClient.post<LoginResponseData>(
      '/login/commit',
      {
        lang: 'vn',
        refNo,
        otp,
        securityChallenge: otp,
        securityCode: otp,
      },
      {
        headers: {
          ...buildAuthHeaders(this.deviceId, this.browserSignature),
          token,
        },
      }
    );

    return this.handleOtpResponse(response);
  }

  /**
   * Verify two-factor OTP (code 6006)
   */
  async verifyTwoFactorOtp(otp: string, refNo: string, token: string): Promise<SessionData> {
    const response = await this.httpClient.post<LoginResponseData>(
      '/login/afs/commit',
      {
        lang: 'vn',
        refNo,
        otp,
        securityChallenge: otp,
        securityCode: otp,
        smsOTP: otp,
      },
      {
        headers: {
          ...buildAuthHeaders(this.deviceId, this.browserSignature),
          token,
        },
      }
    );

    return this.handleOtpResponse(response);
  }

  private handleLoginResponse(response: ApiResponse<LoginResponseData>): LoginResult {
    if (response.success && response.code === API_CODES.SUCCESS && response.data) {
      return {
        success: true,
        session: this.buildSessionData(response.data),
      };
    }

    if (response.code === API_CODES.OTP_REQUIRED && response.data) {
      return {
        success: false,
        otpRequired: {
          type: 'device',
          refNo: response.data.refNo || '',
          token: response.data.token,
        },
      };
    }

    if (response.code === API_CODES.TWO_FACTOR_REQUIRED && response.data) {
      return {
        success: false,
        otpRequired: {
          type: 'twoFactor',
          refNo: response.data.refNo || '',
          token: response.data.token,
        },
      };
    }

    // Handle 401 - Invalid credentials
    if (response.code === API_CODES.UNAUTHORIZED) {
      throw new AuthError('Invalid phone number or password');
    }

    throw new AuthError(response.message || 'Login failed');
  }

  private handleOtpResponse(response: ApiResponse<LoginResponseData>): SessionData {
    if (response.success && response.code === API_CODES.SUCCESS && response.data) {
      return this.buildSessionData(response.data);
    }

    // Check for device invalidation
    if (response.message?.includes('device') && response.message?.includes('invalid')) {
      throw new DeviceInvalidatedError();
    }

    // Check for session expiry
    if (response.message?.includes('session') && response.message?.includes('expired')) {
      throw new SessionExpiredError();
    }

    throw new AuthError(response.message || 'OTP verification failed');
  }

  private buildSessionData(data: LoginResponseData): SessionData {
    if (!data.timoDeviceId) {
      throw new AuthError('Missing timoDeviceId in response');
    }

    return {
      token: data.token,
      userId: data.userId,
      phoneNumber: data.phoneNumber,
      timoDeviceId: data.timoDeviceId,
      contextId: this.contextId,
    };
  }

  /**
   * Get the context ID for this login session
   */
  getContextId(): string {
    return this.contextId;
  }
}
