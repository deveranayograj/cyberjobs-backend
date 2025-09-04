import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { PrismaService } from '@prisma/prisma.service';
import { MailModule } from '@core/mail/mail.module';  // ✅ Add MailModule
import { UsersModule } from '@modules/users/users.module'; // ✅ If using UsersService

@Module({
    imports: [MailModule, UsersModule], // ✅ Import modules
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsRepository, PrismaService],
    exports: [NotificationsService],
})
export class NotificationsModule { }
