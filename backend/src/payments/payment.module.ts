import { Module } from '@nestjs/common';
import { PaymentService, PAYMENT_PROVIDER_TOKEN } from './payment.service';
import { PaystackProvider } from './providers/paystack.provider';

/**
 * To swap payment providers:
 *   1. Create a new class implementing IPaymentProvider in ./providers/
 *   2. Change `useClass: PaystackProvider` below to your new class
 *   Nothing else needs to change.
 */
@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER_TOKEN,
      useClass: PaystackProvider,
    },
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
