import { Inject } from '@nestjs/common';
import { TIMO_CLIENT_TOKEN } from '../constants/injection-tokens.js';

/**
 * Injects the TimoClient instance
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class PaymentService {
 *   constructor(@InjectTimo() private readonly timo: TimoClient) {}
 *
 *   async getBalance() {
 *     return this.timo.getBalance();
 *   }
 * }
 * ```
 */
export const InjectTimo = (): PropertyDecorator & ParameterDecorator =>
  Inject(TIMO_CLIENT_TOKEN);
