import { Module } from '@nestjs/common';
import { ApplyService } from '@modules/job-seeker/apply/apply.service';
import { ApplyController } from '@modules/job-seeker/apply/apply.controller';
import { PrismaService } from '@prisma/prisma.service';

@Module({
  controllers: [ApplyController],
  providers: [ApplyService, PrismaService],
})
export class ApplyModule { }
