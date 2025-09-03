// src/modules/jobs/employer/job.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { JobRepository } from './job.repository';

@Module({
  imports: [PrismaModule],
  controllers: [JobController],
  providers: [JobService, JobRepository],
  exports: [JobRepository], // 👈 optional export if other modules need it
})
export class JobModule { }
