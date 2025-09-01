// src/modules/job-seeker/apply/dtos/apply-job.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JobApplicationSource } from '@prisma/client';

class AnswerDto {
  @IsNotEmpty()
  @IsNumber({}, { message: 'questionId must be a number' })
  questionId: bigint;

  @IsNotEmpty()
  answer: string | string[]; // supports short-answer or multiple-choice
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];
}
