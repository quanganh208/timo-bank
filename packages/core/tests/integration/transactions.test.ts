import { it, expect, beforeAll, afterAll } from 'vitest';
import { TimoClient } from '../../src/client.js';
import type { Transaction } from '../../src/types/models.js';
import { describeIntegration, CREDENTIALS, logIntegration } from '../utils/skip-integration.js';

let client: TimoClient | null = null;

describeIntegration('Integration: Transactions', () => {
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

  it('getTransactions returns array', async () => {
    const start = Date.now();
    const transactions = await client!.getTransactions();
    const duration = Date.now() - start;

    expect(Array.isArray(transactions)).toBe(true);

    logIntegration('getTransactions', {
      success: true,
      duration,
      count: transactions.length,
    });
  }, 30000);

  it('getTransactions with limit option', async () => {
    const start = Date.now();
    const transactions = await client!.getTransactions({ limit: 5 });
    const duration = Date.now() - start;

    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions.length).toBeLessThanOrEqual(5);

    logIntegration('getTransactions-limit', {
      success: true,
      duration,
      count: transactions.length,
      limit: 5,
    });
  }, 30000);

  it('transactions have required properties', async () => {
    const transactions = await client!.getTransactions({ limit: 3 });

    if (transactions.length > 0) {
      const tx: Transaction = transactions[0];

      expect(tx).toHaveProperty('refNo');
      expect(tx).toHaveProperty('txnAmount');
      expect(tx).toHaveProperty('txnDesc');
      expect(tx).toHaveProperty('txnTime');
      expect(tx).toHaveProperty('txnType');

      expect(typeof tx.refNo).toBe('string');
      expect(typeof tx.txnAmount).toBe('number');

      logIntegration('transaction-structure', {
        hasRequiredFields: true,
        sample: {
          refNo: tx.refNo,
          txnType: tx.txnType,
          hasAmount: typeof tx.txnAmount === 'number',
        },
      });
    }
  }, 30000);

  it('getTransactions with date range', async () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const transactions = await client!.getTransactions({
      fromDate: formatDate(thirtyDaysAgo),
      toDate: formatDate(today),
      limit: 10,
    });

    expect(Array.isArray(transactions)).toBe(true);

    logIntegration('getTransactions-dateRange', {
      success: true,
      count: transactions.length,
    });
  }, 30000);
});
