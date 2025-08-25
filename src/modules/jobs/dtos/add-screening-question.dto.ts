// src/modules/jobs/screening-questions/dtos/add-screening-question.dto.ts
import { IsString, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class AddScreeningQuestionDto {
  @IsString()
  question: string;

  @IsString()
  type: string; // e.g., 'single-choice', 'multiple-choice', 'short-answer'

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsBoolean()
  required: boolean;
}
