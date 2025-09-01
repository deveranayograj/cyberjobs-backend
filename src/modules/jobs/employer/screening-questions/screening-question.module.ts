// src/modules/jobs/screening-questions/screening-question.module.ts
import { Module } from '@nestjs/common';
import { ScreeningQuestionService } from '@modules/jobs/employer/screening-questions/screening-question.service';
import { ScreeningQuestionController } from '@modules/jobs/employer/screening-questions/screening-question.controller';
import { PrismaService } from '@prisma/prisma.service';

@Module({
  controllers: [ScreeningQuestionController],
  providers: [ScreeningQuestionService, PrismaService],
  exports: [ScreeningQuestionService], // so JobModule or others can use it
})
export class ScreeningQuestionModule { }
