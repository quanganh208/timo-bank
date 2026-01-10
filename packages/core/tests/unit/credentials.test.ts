import { describe, it, expect } from 'vitest';
import {
  encodeCredentials,
  decodeCredentials,
  isValidTokenFormat,
  TOKEN_PREFIX,
} from '../../src/credentials/encoder.js';
import { parseCredentialToken, maskCredentials } from '../../src/credentials/parser.js';
import { CredentialError } from '../../src/errors/classes.js';
import { createTestLogger } from '../utils/test-logger.js';

const logger = createTestLogger('credentials');

const validCredentials = {
  username: '0901234567',
  password: 'hashedpassword123abc',
  deviceId: 'device123abc456def',
  timoDeviceId: 'timoDevice456xyz789',
  browserSignature: ':WEB:Windows:297:WEB:desktop:chrome',
  createdAt: '2026-01-10T00:00:00Z',
};

describe('credentials/encoder', () => {
  it('encodeCredentials returns prefixed token', () => {
    const start = Date.now();
    const token = encodeCredentials(validCredentials);

    expect(token.startsWith(TOKEN_PREFIX)).toBe(true);
    expect(token.length).toBeGreaterThan(TOKEN_PREFIX.length);
    logger.pass(Date.now() - start, { tokenPrefix: token.slice(0, 15) });
  });

  it('decodeCredentials round-trip preserves data', () => {
    const start = Date.now();
    const token = encodeCredentials(validCredentials);
    const decoded = decodeCredentials(token);

    expect(decoded).toEqual(validCredentials);
    logger.pass(Date.now() - start, { fieldsMatch: true });
  });

  it('decodeCredentials throws on invalid prefix', () => {
    const start = Date.now();
    expect(() => decodeCredentials('invalid_token_here')).toThrow(CredentialError);
    logger.pass(Date.now() - start, { threwError: true });
  });

  it('decodeCredentials throws on malformed base64', () => {
    const start = Date.now();
    expect(() => decodeCredentials(`${TOKEN_PREFIX}!!!invalid-base64!!!`)).toThrow(CredentialError);
    logger.pass(Date.now() - start, { threwError: true });
  });

  it('isValidTokenFormat returns true for valid token', () => {
    const token = encodeCredentials(validCredentials);
    expect(isValidTokenFormat(token)).toBe(true);
  });

  it('isValidTokenFormat returns false for invalid prefix', () => {
    expect(isValidTokenFormat('not_a_valid_token')).toBe(false);
  });

  it('isValidTokenFormat returns false for invalid base64', () => {
    expect(isValidTokenFormat(`${TOKEN_PREFIX}!!!`)).toBe(false);
  });
});

describe('credentials/parser', () => {
  it('parseCredentialToken throws on empty string', () => {
    expect(() => parseCredentialToken('')).toThrow(CredentialError);
  });

  it('parseCredentialToken throws on null-like values', () => {
    expect(() => parseCredentialToken(null as unknown as string)).toThrow(CredentialError);
    expect(() => parseCredentialToken(undefined as unknown as string)).toThrow(CredentialError);
  });

  it('parseCredentialToken throws on wrong prefix', () => {
    expect(() => parseCredentialToken('wrong_prefix_token')).toThrow(CredentialError);
  });

  it('parseCredentialToken successfully parses valid token', () => {
    const token = encodeCredentials(validCredentials);
    const parsed = parseCredentialToken(token);

    expect(parsed.username).toBe(validCredentials.username);
    expect(parsed.password).toBe(validCredentials.password);
    expect(parsed.deviceId).toBe(validCredentials.deviceId);
  });

  it('parseCredentialToken trims whitespace', () => {
    const token = encodeCredentials(validCredentials);
    const parsed = parseCredentialToken(`  ${token}  `);

    expect(parsed.username).toBe(validCredentials.username);
  });

  it('maskCredentials masks phone number', () => {
    const masked = maskCredentials(validCredentials);

    expect(masked.username).toBe('0901******');
    expect(masked.username).not.toBe(validCredentials.username);
  });

  it('maskCredentials masks password completely', () => {
    const masked = maskCredentials(validCredentials);
    expect(masked.password).toBe('***');
  });

  it('maskCredentials masks deviceId partially', () => {
    const masked = maskCredentials(validCredentials);

    expect(masked.deviceId).toContain('...');
    expect(masked.deviceId.length).toBeLessThan(validCredentials.deviceId.length);
  });

  it('maskCredentials preserves createdAt', () => {
    const masked = maskCredentials(validCredentials);
    expect(masked.createdAt).toBe(validCredentials.createdAt);
  });
});
