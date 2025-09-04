import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { AppLogger } from '@app/core/logger/logger.service';
import { verificationTemplate } from './templates/verification.template';
import { notificationTemplate } from './templates/notification.template';
import { EmailType } from './mail.constants';
// import { resetPasswordTemplate } from './templates/reset-password.template'; // if you have this


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

  /**
   * Centralized method to send any type of email
   */
  async sendEmail(
    to: string,
    type: EmailType,
    payload: { [key: string]: any } = {}
  ) {
    let subject: string;
    let html: string;

    switch (type) {
      case EmailType.VERIFICATION:
        subject = 'Verify your Cykruit account';
        html = verificationTemplate(payload.verifyUrl);
        break;

      case EmailType.NOTIFICATION:
        subject = '🔔 New Notification from Cykruit';
        html = notificationTemplate(
          payload.userName ? `${payload.userName}, ${payload.message}` : payload.message,
          payload.link
        );
        break;

      // case EmailType.RESET_PASSWORD:
      //   subject = 'Reset your Cykruit password';
      //   html = resetPasswordTemplate(payload.resetUrl);
      //   break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    try {
      const { error } = await this.resend.emails.send({
        from: `"Cykruit 🚀" <${this.fromEmail}>`,
        replyTo: 'support@cykruit.com',
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

  // Optional helper methods for convenience
  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
    await this.sendEmail(email, EmailType.VERIFICATION, { verifyUrl });
  }

  async sendNotificationEmail(
    email: string,
    message: string,
    link?: string,
    userName?: string
  ) {
    await this.sendEmail(email, EmailType.NOTIFICATION, { message, link, userName });
  }

  async sendResetPasswordEmail(email: string, resetUrl: string) {
    await this.sendEmail(email, EmailType.RESET_PASSWORD, { resetUrl });
  }
}
