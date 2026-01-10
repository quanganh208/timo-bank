#!/usr/bin/env node

import('../dist/cli/setup.js').then(({ runSetup }) => {
  runSetup().catch((error) => {
    console.error('Setup failed:', error.message);
    process.exit(1);
  });
});
