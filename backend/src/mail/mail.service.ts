import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('smtp.host'),
      port: this.config.get<number>('smtp.port'),
      secure: false,
      auth: {
        user: this.config.get<string>('smtp.user'),
        pass: this.config.get<string>('smtp.pass'),
      },
    });
  }

  private get from() {
    const user = this.config.get<string>('smtp.user');
    return `"LearnBuild" <${user}>`;
  }

  private send(to: string, subject: string, html: string) {
    this.transporter.sendMail({ from: this.from, to, subject, html }).catch((err) => {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    });
  }

  sendWelcome(user: { firstName: string; email: string }) {
    this.send(
      user.email,
      'Welcome to LearnBuild!',
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0F1923;color:#F0F6FF;border-radius:12px">
        <h1 style="font-size:22px;margin:0 0 12px">Hi ${user.firstName}, welcome aboard! 🎉</h1>
        <p style="color:#94A3B8;line-height:1.6">
          Your LearnBuild account is ready. Browse the catalog, enroll in courses, and start building your skills today.
        </p>
        <a href="${this.config.get('cors.origin')}/catalog"
          style="display:inline-block;margin-top:20px;padding:10px 22px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Browse courses
        </a>
        <p style="margin-top:24px;font-size:13px;color:#64748B">LearnBuild · learnbuild.edemaukabi.dev</p>
      </div>`,
    );
  }

  sendEnrollmentConfirmation(
    user: { firstName: string; email: string },
    course: { title: string; slug: string },
  ) {
    const learnUrl = `${this.config.get('cors.origin')}/learn/${course.slug}`;
    this.send(
      user.email,
      `You're enrolled in "${course.title}"`,
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0F1923;color:#F0F6FF;border-radius:12px">
        <h1 style="font-size:22px;margin:0 0 12px">Enrollment confirmed!</h1>
        <p style="color:#94A3B8;line-height:1.6">
          Hi ${user.firstName}, you're now enrolled in <strong style="color:#F0F6FF">${course.title}</strong>.
          Jump in and start learning whenever you're ready.
        </p>
        <a href="${learnUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 22px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Start learning
        </a>
        <p style="margin-top:24px;font-size:13px;color:#64748B">LearnBuild · learnbuild.edemaukabi.dev</p>
      </div>`,
    );
  }

  sendPasswordReset(user: { firstName: string; email: string }, resetUrl: string) {
    this.send(
      user.email,
      'Reset your LearnBuild password',
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0F1923;color:#F0F6FF;border-radius:12px">
        <h1 style="font-size:22px;margin:0 0 12px">Hi ${user.firstName}, reset your password</h1>
        <p style="color:#94A3B8;line-height:1.6">
          Someone requested a password reset for your LearnBuild account. Click the button below — this link expires in <strong style="color:#F0F6FF">1 hour</strong>.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 22px;background:#0EA5E9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset password
        </a>
        <p style="margin-top:20px;font-size:13px;color:#64748B">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
        <p style="margin-top:24px;font-size:13px;color:#64748B">LearnBuild · learnbuild.edemaukabi.dev</p>
      </div>`,
    );
  }

  sendCertificateIssued(
    user: { firstName: string; email: string },
    course: { title: string },
    downloadUrl: string,
  ) {
    this.send(
      user.email,
      `Your certificate for "${course.title}" is ready`,
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0F1923;color:#F0F6FF;border-radius:12px">
        <h1 style="font-size:22px;margin:0 0 12px">Congratulations, ${user.firstName}! 🎓</h1>
        <p style="color:#94A3B8;line-height:1.6">
          You've completed <strong style="color:#F0F6FF">${course.title}</strong> and earned your certificate.
          Download it below and share your achievement.
        </p>
        <a href="${downloadUrl}"
          style="display:inline-block;margin-top:20px;padding:10px 22px;background:#0D9488;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Download certificate
        </a>
        <p style="margin-top:24px;font-size:13px;color:#64748B">LearnBuild · learnbuild.edemaukabi.dev</p>
      </div>`,
    );
  }
}
