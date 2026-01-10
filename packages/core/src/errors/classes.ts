/**
 * Base error class for all Timo SDK errors
 */
export class TimoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimoError';
    Object.setPrototypeOf(this, TimoError.prototype);
  }
}

/**
 * Authentication related errors
 */
export class AuthError extends TimoError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Invalid or malformed credential token
 */
export class CredentialError extends TimoError {
  constructor(message: string) {
    super(message);
    this.name = 'CredentialError';
    Object.setPrototypeOf(this, CredentialError.prototype);
  }
}

/**
 * Session has expired, needs re-login
 */
export class SessionExpiredError extends TimoError {
  constructor(message = 'Session expired') {
    super(message);
    this.name = 'SessionExpiredError';
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
  }
}

/**
 * Device has been invalidated by Timo, needs new setup
 */
export class DeviceInvalidatedError extends TimoError {
  constructor(message = 'Device invalidated, run setup again') {
    super(message);
    this.name = 'DeviceInvalidatedError';
    Object.setPrototypeOf(this, DeviceInvalidatedError.prototype);
  }
}

/**
 * API request failed
 */
export class ApiError extends TimoError {
  public readonly code: number;
  public readonly response?: unknown;

  constructor(message: string, code: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
