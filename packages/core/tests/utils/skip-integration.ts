/**
 * Integration test helper - skip tests when no credentials
 */
import { describe, it } from 'vitest';

export const CREDENTIALS = process.env.TIMO_CREDENTIALS;
export const HAS_CREDENTIALS = !!CREDENTIALS;

/**
 * Wrapper for integration tests - skips if no credentials
 */
export function describeIntegration(name: string, fn: () => void) {
  if (!HAS_CREDENTIALS) {
    describe.skip(`[SKIP] ${name} - No TIMO_CREDENTIALS`, () => {
      it('skipped - set TIMO_CREDENTIALS env var to run', () => {});
    });
    return;
  }
  describe(name, fn);
}

/**
 * Log integration test events as JSON
 */
export function logIntegration(action: string, data: unknown) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'debug',
      integration: true,
      action,
      data,
    })
  );
}
