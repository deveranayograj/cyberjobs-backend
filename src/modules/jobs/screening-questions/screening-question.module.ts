// src/modules/jobs/screening-questions/screening-question.module.ts
import { Module } from '@nestjs/common';
import { ScreeningQuestionService } from './screening-question.service';
import { ScreeningQuestionController } from './screening-question.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ScreeningQuestionController],
  providers: [ScreeningQuestionService, PrismaService],
  exports: [ScreeningQuestionService], // so JobModule or others can use it
})
export class ScreeningQuestionModule {}
