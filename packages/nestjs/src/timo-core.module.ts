import {
  Global,
  Module,
  DynamicModule,
  Provider,
  OnModuleInit,
  Inject,
  Logger,
} from '@nestjs/common';
import { TimoClient } from '@timo-bank/core';
import { TIMO_CLIENT_TOKEN, TIMO_MODULE_OPTIONS } from './constants/injection-tokens.js';
import type {
  TimoModuleOptions,
  TimoModuleAsyncOptions,
  TimoOptionsFactory,
} from './interfaces/timo-options.interface.js';

@Global()
@Module({})
export class TimoCoreModule implements OnModuleInit {
  private readonly logger = new Logger(TimoCoreModule.name);

  constructor(
    @Inject(TIMO_CLIENT_TOKEN) private readonly client: TimoClient,
    @Inject(TIMO_MODULE_OPTIONS) private readonly options: TimoModuleOptions
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.options.autoLogin !== false) {
      try {
        await this.client.login();
        this.logger.log('Timo client authenticated successfully');
      } catch (error) {
        this.logger.error('Timo client authentication failed', error);
        throw error;
      }
    }
  }

  /**
   * Synchronous configuration
   */
  static forRoot(options: TimoModuleOptions): DynamicModule {
    const clientProvider = this.createClientProvider();
    const optionsProvider: Provider = {
      provide: TIMO_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: TimoCoreModule,
      providers: [optionsProvider, clientProvider],
      exports: [TIMO_CLIENT_TOKEN],
    };
  }

  /**
   * Asynchronous configuration
   */
  static forRootAsync(options: TimoModuleAsyncOptions): DynamicModule {
    const clientProvider = this.createClientProvider();
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: TimoCoreModule,
      imports: options.imports || [],
      providers: [...asyncProviders, clientProvider],
      exports: [TIMO_CLIENT_TOKEN],
    };
  }

  private static createClientProvider(): Provider {
    return {
      provide: TIMO_CLIENT_TOKEN,
      useFactory: (options: TimoModuleOptions) => {
        return new TimoClient({
          credentials: options.credentials,
          logger: options.logger,
        });
      },
      inject: [TIMO_MODULE_OPTIONS],
    };
  }

  private static createAsyncProviders(options: TimoModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: TIMO_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        {
          provide: TIMO_MODULE_OPTIONS,
          useFactory: async (factory: TimoOptionsFactory) => factory.createTimoOptions(),
          inject: [options.useClass],
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: TIMO_MODULE_OPTIONS,
          useFactory: async (factory: TimoOptionsFactory) => factory.createTimoOptions(),
          inject: [options.useExisting],
        },
      ];
    }

    throw new Error(
      'Invalid TimoModuleAsyncOptions: provide useFactory, useClass, or useExisting'
    );
  }
}
