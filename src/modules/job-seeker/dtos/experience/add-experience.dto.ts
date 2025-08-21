import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class AddExperienceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
