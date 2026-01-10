import { Module } from '@nestjs/common';
import { TimoModule } from '@timo-bank/nestjs';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    TimoModule.forRoot({
      credentials: process.env.TIMO_CREDENTIALS!,
    }),
    PaymentModule,
  ],
})
export class AppModule {}
