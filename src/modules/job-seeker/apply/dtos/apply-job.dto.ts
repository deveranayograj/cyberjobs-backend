// src/modules/job-seeker/apply/dtos/apply-job.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JobApplicationSource } from '@prisma/client';

class AnswerDto {
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value))
  questionId: bigint;

  @IsNotEmpty()
  answer: string | string[];
}

export class ApplyJobDto {
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value))
  jobId: bigint;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? BigInt(value) : undefined))
  resumeId?: bigint;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsEnum(JobApplicationSource)
  source?: JobApplicationSource = JobApplicationSource.DIRECT;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];
}
