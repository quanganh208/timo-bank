/**
 * @timo-bank/nestjs
 * NestJS module for Timo Bank SDK
 */

export const VERSION = '0.1.0';

// Module
export { TimoModule } from './timo.module.js';
export { TimoCoreModule } from './timo-core.module.js';

// Decorators
export { InjectTimo } from './decorators/inject-timo.decorator.js';

// Constants
export { TIMO_CLIENT_TOKEN, TIMO_MODULE_OPTIONS } from './constants/injection-tokens.js';

// Interfaces
export type {
  TimoModuleOptions,
  TimoModuleAsyncOptions,
  TimoOptionsFactory,
} from './interfaces/index.js';

// Re-export core types
export { TimoClient } from '@timo-bank/core';
export type {
  Balance,
  Transaction,
  TransactionOptions,
  AccountInfo,
  UserProfile,
  Logger,
} from '@timo-bank/core';
