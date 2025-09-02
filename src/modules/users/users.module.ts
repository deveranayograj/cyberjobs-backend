import { Module } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersController } from '@modules/users/users.controller';
import { UsersRepository } from './users.repository'; // <-- add this
import { PrismaService } from '@prisma/prisma.service';
import { MailModule } from '@app/core/mail/mail.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaService], // <-- UsersRepository added
  imports: [MailModule],
  exports: [UsersService],
})
export class UsersModule { }
