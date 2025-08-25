import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBigInt,
} from 'class-validator';
import { ApplyType, JobApplicationSource } from '@prisma/client';

export class ApplyJobDto {
  @IsNotEmpty()
  jobId: bigint;

  @IsOptional()
  @IsBigInt()
  resumeId?: bigint;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsEnum(JobApplicationSource)
  source?: JobApplicationSource = JobApplicationSource.DIRECT;
}
