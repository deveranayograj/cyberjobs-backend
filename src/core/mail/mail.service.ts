import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { AppLogger } from '@app/core/logger/logger.service';
import { verificationTemplate } from './templates/verification.template';
import { notificationTemplate } from './templates/notification.template';

@Injectable()
export class MailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private readonly logger: AppLogger) {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      throw new Error('RESEND_API_KEY and EMAIL_FROM must be set in .env');
    }
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM;
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) throw new InternalServerErrorException('Failed to send email');
    } catch (err) {
      this.logger.error('Failed to send email', err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
    const html = verificationTemplate(verifyUrl);
    await this.sendMail(email, 'Verify your Cykruit account', html);
  }

  async sendNotificationEmail(email: string, message: string) {
    const html = notificationTemplate(message);
    await this.sendMail(email, 'New Notification', html);
  }
}
