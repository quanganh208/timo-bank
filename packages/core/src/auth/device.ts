import { randomBytes } from 'node:crypto';
import { DEFAULT_BROWSER_SIGNATURE } from '../utils/constants.js';

/**
 * OS detection for browser signature
 */
function getOSName(): string {
  const platform = process.platform;
  switch (platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'MacOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Windows';
  }
}

/**
 * Browser name based on OS
 */
function getBrowserName(): string {
  const os = getOSName();
  return os === 'MacOS' ? 'safari' : 'chrome';
}

/**
 * Generate a device fingerprint ID
 */
export function generateDeviceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Build browser signature for current platform
 * Format: :WEB:OS:VERSION:WEB:device:browser
 */
export function buildBrowserSignature(): string {
  const os = getOSName();
  const browser = getBrowserName();
  return `:WEB:${os}:297:WEB:desktop:${browser}`;
}

/**
 * Get default browser signature (Windows Chrome)
 */
export function getDefaultBrowserSignature(): string {
  return DEFAULT_BROWSER_SIGNATURE;
}

/**
 * Device credentials used for authentication
 */
export interface DeviceCredentials {
  deviceId: string;
  browserSignature: string;
}

/**
 * Generate new device credentials
 */
export function generateDeviceCredentials(): DeviceCredentials {
  return {
    deviceId: generateDeviceId(),
    browserSignature: buildBrowserSignature(),
  };
}
