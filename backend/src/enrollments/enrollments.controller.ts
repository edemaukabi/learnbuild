import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
  Body,
} from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { EnrollmentsService } from './enrollments.service';
import { PaymentService } from '../payments/payment.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  private readonly logger = new Logger(EnrollmentsController.name);

  constructor(
    private readonly enrollments: EnrollmentsService,
    private readonly payments: PaymentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('check/:courseId')
  async check(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    const enrolled = await this.enrollments.isEnrolled(user.id, courseId);
    return { enrolled };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':courseId/enroll')
  @HttpCode(HttpStatus.CREATED)
  async enroll(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.enrollments.enroll(user.id, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':courseId/checkout')
  async checkout(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.enrollments.initiateCheckout(user.id, user.email, courseId);
  }
}

@Controller('payments')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly enrollments: EnrollmentsService,
    private readonly payments: PaymentService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: Record<string, unknown>,
  ) {
    const signature = req.headers['x-paystack-signature'] as string | undefined;
    const rawBody = req.rawBody;

    if (!rawBody || !signature) {
      this.logger.warn('Webhook received without raw body or signature');
      return { received: true };
    }

    if (!this.payments.validateWebhookSignature(rawBody, signature)) {
      this.logger.warn('Webhook signature validation failed');
      return { received: true };
    }

    const event = this.payments.parseWebhookEvent(body);

    if (event.event === 'charge.success' && event.status === 'success') {
      const meta = event.metadata as { userId?: string; courseId?: string } | undefined;
      const userId = meta?.userId;
      const courseId = meta?.courseId;

      if (!userId || !courseId) {
        this.logger.warn(`Webhook charge.success missing metadata: ref=${event.reference}`);
        return { received: true };
      }

      await this.enrollments.handleSuccessfulPayment({
        reference: event.reference,
        amountKobo: event.amount,
        userId,
        courseId,
      });
    }

    return { received: true };
  }
}
