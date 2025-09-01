import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { AppLogger } from '@common/logger/logger.service';

@Injectable()
export class MailService {
  private sesClient: SESClient;
  private fromEmail: string;

  constructor(private readonly logger: AppLogger) {
    this.logger.log('Initializing MailService with SES...', 'MailService');

    if (!process.env.AWS_REGION || !process.env.EMAIL_FROM) {
      this.logger.error(
        'AWS_REGION or EMAIL_FROM missing in .env',
        '',
        'MailService',
      );
      throw new Error('AWS_REGION and EMAIL_FROM must be set in .env');
    }

    this.sesClient = new SESClient({ region: process.env.AWS_REGION });
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

    const params = {
      Destination: {
        ToAddresses: [to], // SES sandbox requires verified email
      },
      Message: {
        Body: {
          Html: { Data: html },
        },
        Subject: { Data: subject },
      },
      Source: this.fromEmail,
    };

    try {
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      this.logger.log('Email sent successfully', 'MailService');
      this.logger.debug(JSON.stringify(response), 'MailService');
    } catch (err) {
      this.logger.error(
        'Error sending email',
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
