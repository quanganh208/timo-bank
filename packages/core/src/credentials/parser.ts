import type { CredentialData } from '../types/config.js';
import { CredentialError } from '../errors/classes.js';
import { TOKEN_PREFIX, decodeCredentials } from './encoder.js';

/**
 * Extract version from token
 */
export function getTokenVersion(token: string): string {
  if (token.startsWith(TOKEN_PREFIX)) {
    return 'v1';
  }
  throw new CredentialError('Unsupported credential version');
}

/**
 * Parse and validate a credential token
 */
export function parseCredentialToken(token: string): CredentialData {
  if (!token || typeof token !== 'string') {
    throw new CredentialError('Credential token is required');
  }

  const trimmed = token.trim();

  if (!trimmed.startsWith(TOKEN_PREFIX)) {
    throw new CredentialError(
      `Invalid credential token format. Expected token starting with "${TOKEN_PREFIX}"`
    );
  }

  // Validate version
  getTokenVersion(trimmed);

  // Decode and validate
  return decodeCredentials(trimmed);
}

/**
 * Mask sensitive data in credentials for safe logging
 */
export function maskCredentials(data: CredentialData): Record<string, string> {
  return {
    username: maskPhone(data.username),
    password: '***',
    deviceId: maskString(data.deviceId),
    timoDeviceId: maskString(data.timoDeviceId),
    browserSignature: maskBrowserSignature(data.browserSignature),
    createdAt: data.createdAt,
  };
}

function maskBrowserSignature(sig: string): string {
  // Browser signature format: :WEB:OS:VERSION:WEB:device:browser
  // Keep format visible but mask specific values
  const parts = sig.split(':');
  if (parts.length >= 6) {
    return `:${parts[1]}:***:***:${parts[4]}:***:***`;
  }
  return '***';
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return phone.slice(0, 4) + '*'.repeat(phone.length - 4);
}

function maskString(str: string): string {
  if (str.length <= 8) return '****';
  return str.slice(0, 4) + '...' + str.slice(-4);
}
