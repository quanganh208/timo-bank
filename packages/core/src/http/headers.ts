import { sha256, generateUUID } from '../utils/crypto.js';
import { APP_VERSION, DEFAULT_BROWSER_SIGNATURE } from '../utils/constants.js';

/**
 * Build device registration header value
 * Format: deviceId + browserSignature
 */
export function buildDeviceReg(
  deviceId: string,
  signature: string = DEFAULT_BROWSER_SIGNATURE
): string {
  return `${deviceId}${signature}`;
}

/**
 * Build context ID header value
 * Format: sha256(WEB.deviceId.<APP_VERSION>).uuid
 */
export function buildContextId(deviceId: string): string {
  const inputString = `WEB.${deviceId}.${APP_VERSION}`;
  const hashPart = sha256(inputString);
  const uuid = generateUUID();
  return `${hashPart}.${uuid}`;
}

/**
 * Build device key header value (used after login)
 * Format: timoDeviceId + browserSignature
 */
export function buildDeviceKey(
  timoDeviceId: string,
  signature: string = DEFAULT_BROWSER_SIGNATURE
): string {
  return `${timoDeviceId}${signature}`;
}

/**
 * Build authentication headers for API requests
 */
export interface AuthHeaders {
  'x-timo-devicereg': string;
  'x-gofs-context-id': string;
  [key: string]: string;
}

export function buildAuthHeaders(
  deviceId: string,
  signature: string = DEFAULT_BROWSER_SIGNATURE
): AuthHeaders {
  return {
    'x-timo-devicereg': buildDeviceReg(deviceId, signature),
    'x-gofs-context-id': buildContextId(deviceId),
  };
}

/**
 * Build headers for authenticated requests (after login)
 */
export interface SessionHeaders {
  token: string;
  'x-gofs-context-id': string;
  'x-timo-devicekey': string;
  [key: string]: string;
}

export function buildSessionHeaders(
  token: string,
  timoDeviceId: string,
  contextId: string,
  signature: string = DEFAULT_BROWSER_SIGNATURE
): SessionHeaders {
  return {
    token,
    'x-gofs-context-id': contextId,
    'x-timo-devicekey': buildDeviceKey(timoDeviceId, signature),
  };
}
