import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { AddScreeningQuestionDto } from '@modules/jobs/dtos/add-screening-question.dto';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddScreeningQuestionDto)
  screeningQuestions?: AddScreeningQuestionDto[];
}
