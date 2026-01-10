import { Injectable } from '@nestjs/common';
import { InjectTimo, TimoClient } from '@timo-bank/nestjs';

@Injectable()
export class PaymentService {
  constructor(@InjectTimo() private readonly timo: TimoClient) {}

  async getBalance() {
    return this.timo.getBalance();
  }

  async getTransactions(limit?: number) {
    return this.timo.getTransactions({ limit });
  }

  async getAccountInfo() {
    return this.timo.getAccountInfo();
  }
}
