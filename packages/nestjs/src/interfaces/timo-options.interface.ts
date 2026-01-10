import type { ModuleMetadata, Type, InjectionToken } from '@nestjs/common';
import type { Logger } from '@timo-bank/core';

/**
 * Options for TimoModule.forRoot()
 */
export interface TimoModuleOptions {
  /**
   * Credential token from CLI setup
   * Format: timo_v1_<base64>
   */
  credentials: string;

  /**
   * Optional logger
   */
  logger?: Logger;

  /**
   * Auto-login on module init (default: true)
   */
  autoLogin?: boolean;
}

/**
 * Factory interface for async options
 */
export interface TimoOptionsFactory {
  createTimoOptions(): Promise<TimoModuleOptions> | TimoModuleOptions;
}

/**
 * Options for TimoModule.forRootAsync()
 */
export interface TimoModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Use existing provider
   */
  useExisting?: Type<TimoOptionsFactory>;

  /**
   * Use class for options
   */
  useClass?: Type<TimoOptionsFactory>;

  /**
   * Use factory function
   */
  useFactory?: (...args: unknown[]) => Promise<TimoModuleOptions> | TimoModuleOptions;

  /**
   * Inject dependencies for factory
   */
  inject?: InjectionToken[];
}
