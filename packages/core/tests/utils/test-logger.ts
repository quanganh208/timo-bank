/**
 * JSON structured test logger for debugging and verification
 */

interface TestLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  test: string;
  status?: 'pass' | 'fail' | 'skip';
  duration?: number;
  details?: Record<string, unknown>;
}

export function createTestLogger(testName: string) {
  const logs: TestLogEntry[] = [];

  const log = (level: TestLogEntry['level'], details?: Record<string, unknown>) => {
    const entry: TestLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      test: testName,
      details,
    };
    logs.push(entry);
    console.log(JSON.stringify(entry));
  };

  return {
    info: (details?: Record<string, unknown>) => log('info', details),
    warn: (details?: Record<string, unknown>) => log('warn', details),
    error: (details?: Record<string, unknown>) => log('error', details),
    debug: (details?: Record<string, unknown>) => log('debug', details),

    pass: (duration: number, details?: Record<string, unknown>) => {
      const entry: TestLogEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        test: testName,
        status: 'pass',
        duration,
        details,
      };
      logs.push(entry);
      console.log(JSON.stringify(entry));
    },

    fail: (duration: number, details?: Record<string, unknown>) => {
      const entry: TestLogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        test: testName,
        status: 'fail',
        duration,
        details,
      };
      logs.push(entry);
      console.log(JSON.stringify(entry));
    },

    getLogs: () => logs,
  };
}
