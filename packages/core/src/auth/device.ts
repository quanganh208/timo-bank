import { randomBytes } from 'node:crypto';
import { DEFAULT_BROWSER_SIGNATURE } from '../utils/constants.js';

/**
 * Generate a device fingerprint ID
 */
export function generateDeviceId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Build the device signature sent in x-timo-devicereg.
 * Timo's web client uses a fixed signature with no per-OS variation.
 */
export function buildBrowserSignature(): string {
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
