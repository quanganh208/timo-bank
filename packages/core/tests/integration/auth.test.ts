import { it, expect, beforeAll, afterAll } from 'vitest';
import { TimoClient } from '../../src/client.js';
import { describeIntegration, CREDENTIALS, logIntegration } from '../utils/skip-integration.js';

let client: TimoClient | null = null;

describeIntegration('Integration: Auth', () => {
  beforeAll(() => {
    client = new TimoClient({ credentials: CREDENTIALS! });
    logIntegration('client-created', { hasClient: true });
  });

  afterAll(async () => {
    if (client?.isAuthenticated()) {
      await client.logout();
      logIntegration('logout', { success: true });
    }
  });

  it('login succeeds with valid credentials', async () => {
    const start = Date.now();
    await client!.login();
    const duration = Date.now() - start;

    expect(client!.isAuthenticated()).toBe(true);
    logIntegration('login', { success: true, duration });
  }, 30000);

  it('isAuthenticated returns true after login', () => {
    expect(client!.isAuthenticated()).toBe(true);
  });

  it('logout clears authentication', async () => {
    await client!.logout();
    expect(client!.isAuthenticated()).toBe(false);

    // Re-login for subsequent tests
    await client!.login();
    expect(client!.isAuthenticated()).toBe(true);
  }, 30000);
});
