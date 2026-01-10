import { it, expect, beforeAll, afterAll } from 'vitest';
import { TimoClient } from '../../src/client.js';
import type { Balance } from '../../src/types/models.js';
import { describeIntegration, CREDENTIALS, logIntegration } from '../utils/skip-integration.js';

let client: TimoClient | null = null;

describeIntegration('Integration: Balance', () => {
  beforeAll(async () => {
    client = new TimoClient({ credentials: CREDENTIALS! });
    await client.login();
    logIntegration('setup', { loggedIn: true });
  }, 30000);

  afterAll(async () => {
    if (client?.isAuthenticated()) {
      await client.logout();
    }
  });

  it('getBalance returns valid balance object', async () => {
    const start = Date.now();
    const balance: Balance = await client!.getBalance();
    const duration = Date.now() - start;

    expect(balance).toHaveProperty('accountNo');
    expect(balance).toHaveProperty('accountBalance');
    expect(balance).toHaveProperty('availableAmount');

    expect(typeof balance.accountNo).toBe('string');
    expect(typeof balance.accountBalance).toBe('number');
    expect(typeof balance.availableAmount).toBe('number');

    logIntegration('getBalance', {
      success: true,
      duration,
      accountNo: balance.accountNo.slice(0, 4) + '****',
      hasBalance: balance.accountBalance >= 0,
      hasAvailable: balance.availableAmount >= 0,
    });
  }, 30000);

  it('balance amounts are non-negative', async () => {
    const balance = await client!.getBalance();

    expect(balance.accountBalance).toBeGreaterThanOrEqual(0);
    expect(balance.availableAmount).toBeGreaterThanOrEqual(0);
  }, 30000);
});
