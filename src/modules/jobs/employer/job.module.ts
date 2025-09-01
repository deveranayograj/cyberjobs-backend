import { Module } from '@nestjs/common';
import { JobService } from '@modules/jobs/employer/job.service';
import { JobController } from '@modules/jobs/employer/job.controller';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { ScreeningQuestionModule } from '@modules/jobs/employer/screening-questions/screening-question.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Module({
  imports: [AuthModule, ScreeningQuestionModule],
  controllers: [JobController],
  providers: [JobService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JobService],
})
export class JobModule { }
