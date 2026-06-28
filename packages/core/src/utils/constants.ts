/**
 * API configuration constants
 */
export const API_BASE_URL = 'https://app2.timo.vn';
export const API_HOSTNAME = 'app2.timo.vn';

/**
 * Timo web app version embedded in the device signature and context id.
 * Bump when Timo updates their web client — a stale version is rejected at /login with code 6777.
 */
export const APP_VERSION = '324';

/**
 * Device signature sent in x-timo-devicereg.
 * Format: :WEB:WEB:<APP_VERSION>:WEB:desktop:chrome (matches the official web client).
 */
export const DEFAULT_BROWSER_SIGNATURE = `:WEB:WEB:${APP_VERSION}:WEB:desktop:chrome`;

/**
 * Encryption key seed for AES encryption of device ID.
 * This is derived from Timo's public web app and is not a secret.
 * It's used to match the behavior of the official web client.
 */
export const ENCRYPTION_KEY_SEED = 'uuidKeyT1m0@412NTMK';

/**
 * API response codes
 */
export const API_CODES = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  OTP_REQUIRED: 6001,
  TWO_FACTOR_REQUIRED: 6006,
} as const;

/**
 * Default HTTP headers
 */
export const DEFAULT_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'content-type': 'application/json; charset=UTF-8',
  origin: 'https://my.timo.vn',
  referer: 'https://my.timo.vn/',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
} as const;

/**
 * Spend account type code
 */
export const ACCOUNT_TYPE_SPEND = '1025';
