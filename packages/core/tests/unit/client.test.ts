import { describe, it, expect } from 'vitest';
import { TimoClient } from '../../src/client.js';
import { encodeCredentials } from '../../src/credentials/encoder.js';
import { CredentialError } from '../../src/errors/classes.js';
import { createTestLogger } from '../utils/test-logger.js';

const logger = createTestLogger('client');

const mockCredentials = {
  username: '0901234567',
  password: 'hashedpassword123abc456def',
  deviceId: 'device123abc456def789xyz12',
  timoDeviceId: 'timoDevice456xyz789abc123d',
  browserSignature: ':WEB:Windows:297:WEB:desktop:chrome',
  createdAt: '2026-01-10T00:00:00Z',
};

describe('TimoClient', () => {
  describe('constructor', () => {
    it('accepts valid credential token', () => {
      const start = Date.now();
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      expect(client).toBeInstanceOf(TimoClient);
      logger.pass(Date.now() - start, { created: true });
    });

    it('throws on invalid credential token', () => {
      const start = Date.now();

      expect(() => new TimoClient({ credentials: 'invalid_token' })).toThrow(CredentialError);
      logger.pass(Date.now() - start, { threwError: true });
    });

    it('throws on empty credential token', () => {
      expect(() => new TimoClient({ credentials: '' })).toThrow(CredentialError);
    });

    it('accepts optional accountNo', () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({
        credentials: token,
        accountNo: '1234567890',
      });

      expect(client).toBeInstanceOf(TimoClient);
    });

    it('accepts optional logger', () => {
      const token = encodeCredentials(mockCredentials);
      const customLogger = {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      const client = new TimoClient({
        credentials: token,
        logger: customLogger,
      });

      expect(client).toBeInstanceOf(TimoClient);
    });
  });

  describe('isAuthenticated', () => {
    it('returns false before login', () => {
      const start = Date.now();
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      expect(client.isAuthenticated()).toBe(false);
      logger.pass(Date.now() - start, { authenticated: false });
    });
  });

  describe('logout', () => {
    it('can be called when not authenticated', async () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      await expect(client.logout()).resolves.toBeUndefined();
    });

    it('isAuthenticated returns false after logout', async () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      await client.logout();
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('API methods require authentication', () => {
    it('getBalance tries to login (will fail without real API)', async () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      // This will try to auto-login, which fails without real API
      await expect(client.getBalance()).rejects.toThrow();
    });

    it('getTransactions tries to login (will fail without real API)', async () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      await expect(client.getTransactions()).rejects.toThrow();
    });

    it('getAccountInfo tries to login (will fail without real API)', async () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      await expect(client.getAccountInfo()).rejects.toThrow();
    });

    it('getUserProfile tries to login (will fail without real API)', async () => {
      const token = encodeCredentials(mockCredentials);
      const client = new TimoClient({ credentials: token });

      await expect(client.getUserProfile()).rejects.toThrow();
    });
  });
});
