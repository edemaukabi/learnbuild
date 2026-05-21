import { Inject, Injectable } from '@nestjs/common';
import {
  IPaymentProvider,
  InitiatePaymentInput,
  PaymentInitiationResult,
  PaymentVerificationResult,
  WebhookEvent,
} from './interfaces/payment-provider.interface';

export const PAYMENT_PROVIDER_TOKEN = 'PAYMENT_PROVIDER';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_PROVIDER_TOKEN) private readonly provider: IPaymentProvider,
  ) {}

  initiatePayment(input: InitiatePaymentInput): Promise<PaymentInitiationResult> {
    return this.provider.initiatePayment(input);
  }

  verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    return this.provider.verifyPayment(reference);
  }

  validateWebhookSignature(rawBody: Buffer, signature: string): boolean {
    return this.provider.validateWebhookSignature(rawBody, signature);
  }

  parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
    return this.provider.parseWebhookEvent(payload);
  }
}
