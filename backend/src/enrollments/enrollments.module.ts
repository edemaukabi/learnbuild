import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController, WebhookController } from './enrollments.controller';
import { PaymentModule } from '../payments/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [EnrollmentsController, WebhookController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
