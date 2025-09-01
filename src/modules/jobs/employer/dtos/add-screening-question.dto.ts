import { IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean, IsString } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class AddScreeningQuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsEnum(QuestionType) // ✅ ensure only valid enum values are allowed
  type: QuestionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
