import { Module, DynamicModule } from '@nestjs/common';
import { TimoCoreModule } from './timo-core.module.js';
import type { TimoModuleOptions, TimoModuleAsyncOptions } from './interfaces/timo-options.interface.js';

@Module({})
export class TimoModule {
  /**
   * Register TimoModule with synchronous options
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     TimoModule.forRoot({
   *       credentials: process.env.TIMO_CREDENTIALS!,
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(options: TimoModuleOptions): DynamicModule {
    return {
      module: TimoModule,
      imports: [TimoCoreModule.forRoot(options)],
      exports: [TimoCoreModule],
    };
  }

  /**
   * Register TimoModule with asynchronous options
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     TimoModule.forRootAsync({
   *       imports: [ConfigModule],
   *       useFactory: (config: ConfigService) => ({
   *         credentials: config.get('TIMO_CREDENTIALS'),
   *       }),
   *       inject: [ConfigService],
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRootAsync(options: TimoModuleAsyncOptions): DynamicModule {
    return {
      module: TimoModule,
      imports: [TimoCoreModule.forRootAsync(options)],
      exports: [TimoCoreModule],
    };
  }
}
