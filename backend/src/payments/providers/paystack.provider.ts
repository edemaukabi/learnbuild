import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentProvider,
  InitiatePaymentInput,
  PaymentInitiationResult,
  PaymentVerificationResult,
  WebhookEvent,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class PaystackProvider implements IPaymentProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private config: ConfigService) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<PaymentInitiationResult> {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: input.email,
          amount: input.amount,
          reference: input.reference,
          currency: input.currency ?? 'NGN',
          callback_url: input.callbackUrl,
          metadata: input.metadata,
        },
        { headers: this.headers() },
      );

      return {
        reference: data.data.reference,
        checkoutUrl: data.data.authorization_url,
      };
    } catch (err) {
      this.logger.error('Paystack initiatePayment failed', (err as AxiosError).message);
      throw new InternalServerErrorException('Payment initiation failed');
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: this.headers() },
      );

      const tx = data.data;
      return {
        reference: tx.reference,
        status:
          tx.status === 'success'
            ? 'success'
            : tx.status === 'failed'
              ? 'failed'
              : 'pending',
        amount: tx.amount,
        email: tx.customer.email,
        metadata: tx.metadata ?? {},
      };
    } catch (err) {
      this.logger.error('Paystack verifyPayment failed', (err as AxiosError).message);
      throw new InternalServerErrorException('Payment verification failed');
    }
  }

  validateWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const secret = this.config.get<string>('paystack.webhookSecret') ?? '';
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    return hash === signature;
  }

  parseWebhookEvent(payload: Record<string, unknown>): WebhookEvent {
    const data = payload.data as Record<string, unknown>;
    const customer = data.customer as Record<string, unknown>;
    return {
      event: payload.event as string,
      reference: data.reference as string,
      status: (data.status as string) === 'success' ? 'success' : 'failed',
      amount: data.amount as number,
      email: customer.email as string,
      metadata: (data.metadata as Record<string, unknown>) ?? {},
    };
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.config.get<string>('paystack.secretKey')}`,
      'Content-Type': 'application/json',
    };
  }
}
