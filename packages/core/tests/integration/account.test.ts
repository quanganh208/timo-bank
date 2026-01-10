import { it, expect, beforeAll, afterAll } from 'vitest';
import { TimoClient } from '../../src/client.js';
import type { AccountInfo, UserProfile } from '../../src/types/models.js';
import { describeIntegration, CREDENTIALS, logIntegration } from '../utils/skip-integration.js';

let client: TimoClient | null = null;

describeIntegration('Integration: Account', () => {
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

  it('getAccountInfo returns account info', async () => {
    const start = Date.now();
    const info: AccountInfo = await client!.getAccountInfo();
    const duration = Date.now() - start;

    expect(info).toHaveProperty('userId');
    expect(typeof info.userId).toBe('string');
    expect(info.userId.length).toBeGreaterThan(0);

    // phoneNumber may be optional depending on API response
    if (info.phoneNumber) {
      expect(typeof info.phoneNumber).toBe('string');
    }

    logIntegration('getAccountInfo', {
      success: true,
      duration,
      userId: info.userId,
      hasPhone: !!info.phoneNumber,
      hasAccountNo: !!info.accountNo,
    });
  }, 30000);

  it('getUserProfile returns user profile', async () => {
    const start = Date.now();
    const profile: UserProfile = await client!.getUserProfile();
    const duration = Date.now() - start;

    expect(profile).toHaveProperty('userId');
    expect(typeof profile.userId).toBe('string');
    expect(profile.userId.length).toBeGreaterThan(0);

    // phoneNumber may be optional depending on API response
    if (profile.phoneNumber) {
      expect(typeof profile.phoneNumber).toBe('string');
    }

    logIntegration('getUserProfile', {
      success: true,
      duration,
      userId: profile.userId,
      hasPhone: !!profile.phoneNumber,
      hasFullName: !!profile.fullName,
      hasEmail: !!profile.email,
    });
  }, 30000);

  it('account info userId matches profile userId', async () => {
    const info = await client!.getAccountInfo();
    const profile = await client!.getUserProfile();

    expect(info.userId).toBe(profile.userId);

    logIntegration('userId-consistency', {
      match: true,
      userId: info.userId,
    });
  }, 30000);
});
