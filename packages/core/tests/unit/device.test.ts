import { describe, it, expect } from 'vitest';
import {
  generateDeviceId,
  buildBrowserSignature,
  generateDeviceCredentials,
} from '../../src/auth/device.js';
import { APP_VERSION, DEFAULT_BROWSER_SIGNATURE } from '../../src/utils/constants.js';
import { createTestLogger } from '../utils/test-logger.js';

// Derive expectations from the source constants so an APP_VERSION bump
// (e.g. an automated Timo-version PR) does not require touching these tests.
const sigFormat = new RegExp(`^:WEB:\\w+:${APP_VERSION}:WEB:desktop:\\w+$`);

const logger = createTestLogger('device');

describe('device/generateDeviceId', () => {
  it('produces 32 character hex string', () => {
    const start = Date.now();
    const id = generateDeviceId();

    expect(id).toHaveLength(32);
    expect(id).toMatch(/^[a-f0-9]+$/);
    logger.pass(Date.now() - start, { idLength: id.length });
  });

  it('produces unique values on each call', () => {
    const id1 = generateDeviceId();
    const id2 = generateDeviceId();
    const id3 = generateDeviceId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('generates 16 bytes (32 hex chars)', () => {
    const id = generateDeviceId();
    // 16 bytes = 32 hex characters
    expect(id.length).toBe(16 * 2);
  });
});

describe('device/buildBrowserSignature', () => {
  it('has correct format :WEB:WEB:VERSION:WEB:device:browser', () => {
    const start = Date.now();
    const sig = buildBrowserSignature();

    // Format: :WEB:WEB:<APP_VERSION>:WEB:desktop:chrome
    expect(sig).toMatch(sigFormat);
    logger.pass(Date.now() - start, { signature: sig });
  });

  it('starts with :WEB:', () => {
    const sig = buildBrowserSignature();
    expect(sig.startsWith(':WEB:')).toBe(true);
  });

  it('contains the current APP_VERSION', () => {
    const sig = buildBrowserSignature();
    expect(sig).toContain(`:${APP_VERSION}:`);
  });

  it('contains desktop device type', () => {
    const sig = buildBrowserSignature();
    expect(sig).toContain(':desktop:');
  });
});

describe('device/buildBrowserSignature default value', () => {
  it('returns the fixed web client signature', () => {
    const sig = buildBrowserSignature();

    expect(sig).toBe(DEFAULT_BROWSER_SIGNATURE);
  });
});

describe('device/generateDeviceCredentials', () => {
  it('returns object with deviceId and browserSignature', () => {
    const start = Date.now();
    const creds = generateDeviceCredentials();

    expect(creds).toHaveProperty('deviceId');
    expect(creds).toHaveProperty('browserSignature');
    logger.pass(Date.now() - start, { hasProperties: true });
  });

  it('deviceId is 32 char hex', () => {
    const creds = generateDeviceCredentials();

    expect(creds.deviceId).toHaveLength(32);
    expect(creds.deviceId).toMatch(/^[a-f0-9]+$/);
  });

  it('browserSignature has correct format', () => {
    const creds = generateDeviceCredentials();

    expect(creds.browserSignature).toMatch(sigFormat);
  });

  it('produces unique deviceId each time', () => {
    const creds1 = generateDeviceCredentials();
    const creds2 = generateDeviceCredentials();

    expect(creds1.deviceId).not.toBe(creds2.deviceId);
  });
});
