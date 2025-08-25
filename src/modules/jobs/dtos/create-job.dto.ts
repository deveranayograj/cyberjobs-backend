import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsDateString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EmploymentTypeEnum,
  ExperienceLevelEnum,
  SalaryTypeEnum,
  CurrencyEnum,
  ApplyTypeEnum,
  WorkModeEnum,
  JobStatusEnum,
} from '@modules/jobs/enums';
import { AddScreeningQuestionDto } from '@modules/jobs/dtos/add-screening-question.dto';

export class CreateJobDto {
  @IsString() title: string;
  @IsString() industry: string;
  @IsEnum(WorkModeEnum) workMode: WorkModeEnum;
  @IsEnum(EmploymentTypeEnum) employmentType: EmploymentTypeEnum;
  @IsEnum(ExperienceLevelEnum) experience: ExperienceLevelEnum;
  @IsNumber() salaryMin: number;
  @IsNumber() salaryMax: number;
  @IsEnum(SalaryTypeEnum) salaryType: SalaryTypeEnum;
  @IsEnum(CurrencyEnum) currency: CurrencyEnum;
  @IsDateString() validTill: string;
  @IsString() description: string;
  @IsArray() @IsString({ each: true }) requirements: string[];
  @IsArray() @IsString({ each: true }) responsibilities: string[];
  @IsArray() @IsString({ each: true }) benefits: string[];
  @IsOptional() @IsString() educationLevel?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) certifications?: string[];
  @IsOptional() @IsBoolean() clearanceRequired?: boolean;
  @IsEnum(ApplyTypeEnum) applyType: ApplyTypeEnum;
  @IsOptional() @IsUrl() applyUrl?: string;
  @IsOptional() @IsString() applicationEmail?: string;
  @IsOptional() @IsNumber() applicationLimit?: number;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isUrgent?: boolean;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsNumber() jobCategoryId?: number;
  @IsOptional() @IsNumber() locationId?: number;
  @IsOptional() @IsEnum(JobStatusEnum) status?: JobStatusEnum;

  // Add screening questions
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddScreeningQuestionDto)
  screeningQuestions?: AddScreeningQuestionDto[];
}
