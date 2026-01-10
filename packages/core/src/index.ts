/**
 * @timo-bank/core
 * Unofficial Timo Bank SDK
 */

export const VERSION = '0.1.0';

// Main client
export { TimoClient } from './client.js';

// Types
export * from './types/index.js';

// Errors
export * from './errors/index.js';

// Credentials
export * from './credentials/index.js';

// Utils (selective exports)
export { sha512, generateUUID } from './utils/crypto.js';
export { API_CODES, ACCOUNT_TYPE_SPEND } from './utils/constants.js';

// HTTP
export { HttpClient } from './http/client.js';
export type { RequestOptions } from './http/client.js';
export {
  buildDeviceReg,
  buildContextId,
  buildDeviceKey,
  buildAuthHeaders,
  buildSessionHeaders,
} from './http/headers.js';
export type { AuthHeaders, SessionHeaders } from './http/headers.js';

// Auth
export {
  generateDeviceId,
  buildBrowserSignature,
  generateDeviceCredentials,
} from './auth/device.js';
export type { DeviceCredentials } from './auth/device.js';
export { LoginManager } from './auth/login.js';
export type { SessionData, OtpRequirement, LoginResult } from './auth/login.js';
