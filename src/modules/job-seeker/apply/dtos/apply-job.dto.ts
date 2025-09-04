import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JobApplicationSource } from '@prisma/client';

class AnswerDto {
  @IsNotEmpty({ message: 'questionId is required' })
  @Transform(({ value }) => (value !== undefined ? BigInt(value) : undefined), { toClassOnly: true })
  questionId: bigint;

  @IsNotEmpty({ message: 'answer is required' })
  answer: string | string[] | number;
}

export class ApplyJobDto {
  @IsNotEmpty({ message: 'jobId is required' })
  @Transform(({ value }) => BigInt(value), { toClassOnly: true })
  jobId: bigint;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? BigInt(value) : undefined), { toClassOnly: true })
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
