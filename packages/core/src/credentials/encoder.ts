import type { CredentialData } from '../types/config.js';
import { CredentialError } from '../errors/classes.js';

export const TOKEN_PREFIX = 'timo_v1_';
export const TOKEN_VERSION = 'v1';

/**
 * Encode credential data to a token string.
 * Note: Base64 encoding is NOT encryption - tokens should be treated as secrets.
 */
export function encodeCredentials(data: CredentialData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json, 'utf-8').toString('base64');
  return `${TOKEN_PREFIX}${base64}`;
}

/**
 * Decode a credential token to credential data
 */
export function decodeCredentials(token: string): CredentialData {
  if (!token.startsWith(TOKEN_PREFIX)) {
    throw new CredentialError('Invalid credential token format');
  }

  const base64 = token.slice(TOKEN_PREFIX.length);

  try {
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const data = JSON.parse(json) as CredentialData;

    // Validate all required fields
    if (
      !data.username ||
      !data.password ||
      !data.deviceId ||
      !data.timoDeviceId ||
      !data.browserSignature ||
      !data.createdAt
    ) {
      throw new CredentialError('Invalid credential data: missing required fields');
    }

    return data;
  } catch (error) {
    if (error instanceof CredentialError) {
      throw error;
    }
    throw new CredentialError('Failed to decode credential token');
  }
}

/**
 * Validate a credential token format without fully decoding
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return false;
  }

  const base64 = token.slice(TOKEN_PREFIX.length);

  try {
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}
