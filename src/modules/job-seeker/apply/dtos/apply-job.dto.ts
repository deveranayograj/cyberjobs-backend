// src/modules/job-seeker/apply/dtos/apply-job.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { JobApplicationSource } from '@prisma/client';

export class ApplyJobDto {
  @IsNotEmpty()
  @IsNumber({}, { message: 'jobId must be a number' })
  jobId: bigint;

  @IsOptional()
  @IsNumber({}, { message: 'resumeId must be a number' })
  resumeId?: bigint;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsEnum(JobApplicationSource)
  source?: JobApplicationSource = JobApplicationSource.DIRECT;
}
