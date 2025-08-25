import { IsString, IsArray, IsBoolean } from 'class-validator';

export class AddScreeningQuestionDto {
  @IsString()
  question: string;

  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsBoolean()
  required: boolean;
}
