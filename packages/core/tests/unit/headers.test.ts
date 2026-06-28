import { describe, it, expect } from 'vitest';
import {
  buildDeviceReg,
  buildContextId,
  buildDeviceKey,
  buildAuthHeaders,
  buildSessionHeaders,
} from '../../src/http/headers.js';
import { createTestLogger } from '../utils/test-logger.js';

const logger = createTestLogger('headers');

const testDeviceId = 'abc123def456abc123def456abc12345';
const testTimoDeviceId = 'timo789xyz123abc456def789xyz1234';
const testSignature = ':WEB:WEB:324:WEB:desktop:chrome';
const testToken = 'testtoken123abc456';
const testContextId = 'abcdef1234567890.uuid-here-1234';

describe('headers/buildDeviceReg', () => {
  it('concatenates deviceId and signature', () => {
    const start = Date.now();
    const result = buildDeviceReg(testDeviceId, testSignature);

    expect(result).toBe(testDeviceId + testSignature);
    logger.pass(Date.now() - start, { resultLength: result.length });
  });

  it('uses default signature when not provided', () => {
    const result = buildDeviceReg(testDeviceId);

    expect(result).toContain(testDeviceId);
    expect(result).toContain(':WEB:');
  });
});

describe('headers/buildContextId', () => {
  it('produces hash.uuid format', () => {
    const start = Date.now();
    const result = buildContextId(testDeviceId);

    // Format: 64 char hash + . + UUID
    expect(result).toMatch(/^[a-f0-9]{64}\.[a-f0-9-]{36}$/);
    logger.pass(Date.now() - start, { format: 'hash.uuid' });
  });

  it('hash part is 64 characters', () => {
    const result = buildContextId(testDeviceId);
    const hashPart = result.split('.')[0];

    expect(hashPart).toHaveLength(64);
  });

  it('uuid part is valid UUID format', () => {
    const result = buildContextId(testDeviceId);
    const uuidPart = result.split('.')[1];

    expect(uuidPart).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('same deviceId produces same hash prefix', () => {
    const result1 = buildContextId(testDeviceId);
    const result2 = buildContextId(testDeviceId);

    const hash1 = result1.split('.')[0];
    const hash2 = result2.split('.')[0];

    expect(hash1).toBe(hash2);
  });

  it('uuid part is unique each call', () => {
    const result1 = buildContextId(testDeviceId);
    const result2 = buildContextId(testDeviceId);

    const uuid1 = result1.split('.')[1];
    const uuid2 = result2.split('.')[1];

    expect(uuid1).not.toBe(uuid2);
  });
});

describe('headers/buildDeviceKey', () => {
  it('concatenates timoDeviceId and signature', () => {
    const start = Date.now();
    const result = buildDeviceKey(testTimoDeviceId, testSignature);

    expect(result).toBe(testTimoDeviceId + testSignature);
    logger.pass(Date.now() - start);
  });

  it('uses default signature when not provided', () => {
    const result = buildDeviceKey(testTimoDeviceId);

    expect(result).toContain(testTimoDeviceId);
    expect(result).toContain(':WEB:');
  });
});

describe('headers/buildAuthHeaders', () => {
  it('returns object with x-timo-devicereg', () => {
    const start = Date.now();
    const headers = buildAuthHeaders(testDeviceId, testSignature);

    expect(headers).toHaveProperty('x-timo-devicereg');
    expect(headers['x-timo-devicereg']).toContain(testDeviceId);
    logger.pass(Date.now() - start);
  });

  it('returns object with x-gofs-context-id', () => {
    const headers = buildAuthHeaders(testDeviceId, testSignature);

    expect(headers).toHaveProperty('x-gofs-context-id');
    expect(headers['x-gofs-context-id']).toMatch(/^[a-f0-9]{64}\./);
  });

  it('uses default signature when not provided', () => {
    const headers = buildAuthHeaders(testDeviceId);

    expect(headers['x-timo-devicereg']).toContain(':WEB:');
  });
});

describe('headers/buildSessionHeaders', () => {
  it('returns object with token', () => {
    const start = Date.now();
    const headers = buildSessionHeaders(testToken, testTimoDeviceId, testContextId, testSignature);

    expect(headers.token).toBe(testToken);
    logger.pass(Date.now() - start);
  });

  it('returns object with x-gofs-context-id', () => {
    const headers = buildSessionHeaders(testToken, testTimoDeviceId, testContextId, testSignature);

    expect(headers['x-gofs-context-id']).toBe(testContextId);
  });

  it('returns object with x-timo-devicekey', () => {
    const headers = buildSessionHeaders(testToken, testTimoDeviceId, testContextId, testSignature);

    expect(headers['x-timo-devicekey']).toContain(testTimoDeviceId);
    expect(headers['x-timo-devicekey']).toContain(testSignature);
  });

  it('uses default signature when not provided', () => {
    const headers = buildSessionHeaders(testToken, testTimoDeviceId, testContextId);

    expect(headers['x-timo-devicekey']).toContain(':WEB:');
  });
});
