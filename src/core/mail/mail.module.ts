import { Module } from '@nestjs/common';
import { MailService } from '@app/core/mail/mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // export so other modules can use it
})
export class MailModule {}
