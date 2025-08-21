import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MailModule } from '../../common/mail/mail.module'; // <-- import your mail module

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  imports: [MailModule], // <-- import here
  exports: [UsersService],
})
export class UsersModule {}
