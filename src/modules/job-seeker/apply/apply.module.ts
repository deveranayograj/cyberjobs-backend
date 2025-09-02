import { Module } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { ApplyController } from './apply.controller';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { ApplyRepository } from './apply.repository'; // ✅ add repository if exists

@Module({
  imports: [AuthModule],
  controllers: [ApplyController],
  providers: [
    ApplyService,
    ApplyRepository, // ✅ include repository if service depends on it
    PrismaService,
  ],
  exports: [ApplyService],
})
export class ApplyModule { }
