import { describe, it, expect } from 'vitest';
import {
  generateDeviceId,
  buildBrowserSignature,
  getDefaultBrowserSignature,
  generateDeviceCredentials,
} from '../../src/auth/device.js';
import { createTestLogger } from '../utils/test-logger.js';

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
  it('has correct format :WEB:OS:VERSION:WEB:device:browser', () => {
    const start = Date.now();
    const sig = buildBrowserSignature();

    // Format: :WEB:OS:297:WEB:desktop:browser
    expect(sig).toMatch(/^:WEB:\w+:297:WEB:desktop:\w+$/);
    logger.pass(Date.now() - start, { signature: sig });
  });

  it('starts with :WEB:', () => {
    const sig = buildBrowserSignature();
    expect(sig.startsWith(':WEB:')).toBe(true);
  });

  it('contains version 297', () => {
    const sig = buildBrowserSignature();
    expect(sig).toContain(':297:');
  });

  it('contains desktop device type', () => {
    const sig = buildBrowserSignature();
    expect(sig).toContain(':desktop:');
  });
});

describe('device/getDefaultBrowserSignature', () => {
  it('returns Windows Chrome signature', () => {
    const sig = getDefaultBrowserSignature();

    expect(sig).toBe(':WEB:Windows:297:WEB:desktop:chrome');
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

    expect(creds.browserSignature).toMatch(/^:WEB:\w+:297:WEB:desktop:\w+$/);
  });

  it('produces unique deviceId each time', () => {
    const creds1 = generateDeviceCredentials();
    const creds2 = generateDeviceCredentials();

    expect(creds1.deviceId).not.toBe(creds2.deviceId);
  });
});
