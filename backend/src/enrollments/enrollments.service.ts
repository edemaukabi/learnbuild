import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CourseStatus, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from '../payments/payment.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const row = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return !!row;
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }
    if (Number(course.price) > 0) {
      throw new BadRequestException('Paid course — use the checkout endpoint');
    }

    const already = await this.isEnrolled(userId, courseId);
    if (already) throw new ConflictException('Already enrolled');

    const [enrollment] = await this.prisma.$transaction([
      this.prisma.enrollment.create({
        data: { userId, courseId, paymentStatus: PaymentStatus.FREE, amountPaid: 0 },
      }),
      this.prisma.course.update({
        where: { id: courseId },
        data: { totalStudents: { increment: 1 } },
      }),
    ]);

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } });
    if (user) this.mail.sendEnrollmentConfirmation(user, { title: course.title, slug: course.slug });

    return enrollment;
  }

  async initiateCheckout(userId: string, email: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }
    if (Number(course.price) === 0) {
      throw new BadRequestException('Free course — use the enroll endpoint');
    }

    const already = await this.isEnrolled(userId, courseId);
    if (already) throw new ConflictException('Already enrolled');

    const reference = crypto.randomUUID();
    const amountKobo = Math.round(Number(course.price) * 100);
    const frontendUrl = this.config.get<string>('cors.origin');

    const { checkoutUrl } = await this.paymentService.initiatePayment({
      amount: amountKobo,
      email,
      reference,
      callbackUrl: `${frontendUrl}/catalog/${course.slug}?payment=success`,
      metadata: { userId, courseId },
    });

    return { checkoutUrl, reference };
  }

  async handleSuccessfulPayment(opts: {
    reference: string;
    amountKobo: number;
    userId: string;
    courseId: string;
  }) {
    const { reference, amountKobo, userId, courseId } = opts;

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      this.logger.log(`Duplicate webhook for ref ${reference} — skipping`);
      return;
    }

    await this.prisma.$transaction([
      this.prisma.enrollment.create({
        data: {
          userId,
          courseId,
          paystackRef: reference,
          paymentStatus: PaymentStatus.PAID,
          amountPaid: amountKobo / 100,
        },
      }),
      this.prisma.course.update({
        where: { id: courseId },
        data: { totalStudents: { increment: 1 } },
      }),
    ]);

    this.logger.log(`Enrollment created via webhook: userId=${userId} courseId=${courseId}`);

    const [user, course] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, email: true } }),
      this.prisma.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } }),
    ]);
    if (user && course) this.mail.sendEnrollmentConfirmation(user, course);
  }
}
