import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { AppLogger } from '@common/logger/logger.service';

@Injectable()
export class MailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private readonly logger: AppLogger) {
    this.logger.log('Initializing MailService with Resend...', 'MailService');

    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      this.logger.error(
        'RESEND_API_KEY or EMAIL_FROM missing in .env',
        '',
        'MailService',
      );
      throw new Error('RESEND_API_KEY and EMAIL_FROM must be set in .env');
    }

    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.EMAIL_FROM;

    this.logger.log(
      `MailService initialized with fromEmail=${this.fromEmail}`,
      'MailService',
    );
  }

  async sendMail(to: string, subject: string, html: string) {
    this.logger.debug(
      `Sending email to ${to} with subject "${subject}"`,
      'MailService',
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error('Error sending email', JSON.stringify(error), 'MailService');
        throw new InternalServerErrorException('Failed to send email');
      }

      this.logger.log('Email sent successfully', 'MailService');
      this.logger.debug(JSON.stringify(data), 'MailService');
    } catch (err) {
      this.logger.error(
        'Exception while sending email',
        JSON.stringify(err),
        'MailService',
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    this.logger.debug(
      `Preparing verification email for ${email} with token ${token}`,
      'MailService',
    );

    const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
    const html = `
      <h2>Welcome to CyberJobs 🚀</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendMail(email, 'Verify your CyberJobs account', html);
  }
}
