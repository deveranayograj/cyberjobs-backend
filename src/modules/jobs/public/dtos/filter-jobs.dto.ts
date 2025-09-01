import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, WorkMode } from '@prisma/client';

export class FilterJobsDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsString() location?: string;
    @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
    @IsOptional() @IsEnum(WorkMode) workMode?: WorkMode;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 20;
}
