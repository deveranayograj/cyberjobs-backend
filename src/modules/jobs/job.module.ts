import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { ScreeningQuestionModule } from '@modules/jobs/screening-questions/screening-question.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Module({
  imports: [AuthModule, ScreeningQuestionModule],
  controllers: [JobController],
  providers: [JobService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JobService],
})
export class JobModule {}
