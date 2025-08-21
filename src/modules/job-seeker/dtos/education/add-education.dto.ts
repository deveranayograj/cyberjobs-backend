import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class AddEducationDto {
  @IsNotEmpty()
  @IsString()
  institution: string;

  @IsNotEmpty()
  @IsString()
  degree: string;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
