import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('balance')
  async getBalance() {
    return this.paymentService.getBalance();
  }

  @Get('transactions')
  async getTransactions(@Query('limit') limit?: string) {
    return this.paymentService.getTransactions(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('account')
  async getAccountInfo() {
    return this.paymentService.getAccountInfo();
  }
}
