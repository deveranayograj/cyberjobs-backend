// src/modules/jobs/screening-questions/dtos/update-screening-question.dto.ts
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class UpdateScreeningQuestionDto {
  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  required?: boolean;
}
