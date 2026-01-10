import { describe, it, expect } from 'vitest';
import { sha256, sha512, generateUUID } from '../../src/utils/crypto.js';
import { createTestLogger } from '../utils/test-logger.js';

const logger = createTestLogger('crypto');

describe('crypto/sha256', () => {
  it('produces 64 character hex string', () => {
    const start = Date.now();
    const hash = sha256('test');

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
    logger.pass(Date.now() - start, { hashLength: hash.length });
  });

  it('is deterministic - same input same output', () => {
    const hash1 = sha256('hello world');
    const hash2 = sha256('hello world');

    expect(hash1).toBe(hash2);
  });

  it('different inputs produce different hashes', () => {
    const hash1 = sha256('input1');
    const hash2 = sha256('input2');

    expect(hash1).not.toBe(hash2);
  });

  it('handles empty string', () => {
    const hash = sha256('');
    expect(hash).toHaveLength(64);
  });

  it('handles unicode characters', () => {
    const hash = sha256('xin chào việt nam');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});

describe('crypto/sha512', () => {
  it('produces 128 character hex string', () => {
    const start = Date.now();
    const hash = sha512('test');

    expect(hash).toHaveLength(128);
    expect(hash).toMatch(/^[a-f0-9]+$/);
    logger.pass(Date.now() - start, { hashLength: hash.length });
  });

  it('is deterministic - same input same output', () => {
    const hash1 = sha512('password123');
    const hash2 = sha512('password123');

    expect(hash1).toBe(hash2);
  });

  it('different inputs produce different hashes', () => {
    const hash1 = sha512('password1');
    const hash2 = sha512('password2');

    expect(hash1).not.toBe(hash2);
  });

  it('handles empty string', () => {
    const hash = sha512('');
    expect(hash).toHaveLength(128);
  });
});

describe('crypto/generateUUID', () => {
  it('produces valid UUID v4 format', () => {
    const start = Date.now();
    const uuid = generateUUID();

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where y is 8, 9, a, or b
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    logger.pass(Date.now() - start, { uuid });
  });

  it('produces unique values on each call', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    const uuid3 = generateUUID();

    expect(uuid1).not.toBe(uuid2);
    expect(uuid2).not.toBe(uuid3);
    expect(uuid1).not.toBe(uuid3);
  });

  it('produces correct length (36 chars with dashes)', () => {
    const uuid = generateUUID();
    expect(uuid).toHaveLength(36);
  });

  it('generates many unique UUIDs', () => {
    const uuids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID());
    }
    expect(uuids.size).toBe(100);
  });
});
