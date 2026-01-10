/**
 * Vitest global setup
 */
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      event: 'test-suite-start',
      env: {
        hasCredentials: !!process.env.TIMO_CREDENTIALS,
        nodeVersion: process.version,
      },
    })
  );
});

afterAll(() => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      event: 'test-suite-end',
    })
  );
});
