import { IsString, IsOptional, IsUrl, IsArray, IsInt } from 'class-validator';

export class UpdateEmployerProfileDto {
    @IsOptional()
    @IsString()
    industry?: string;

    @IsOptional()
    @IsInt()
    foundedYear?: number;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsString()
    mission?: string;

    @IsOptional()
    @IsString()
    vision?: string;

    @IsOptional()
    @IsArray()
    values?: string[];

    @IsOptional()
    @IsUrl()
    linkedIn?: string;

    @IsOptional()
    @IsUrl()
    twitter?: string;

    @IsOptional()
    @IsUrl()
    facebook?: string;

    @IsOptional()
    @IsUrl()
    instagram?: string;

    @IsOptional()
    @IsUrl()
    youtube?: string;

    @IsOptional()
    @IsUrl()
    glassdoor?: string;

    @IsOptional()
    @IsUrl()
    crunchbase?: string;

    @IsOptional()
    @IsString()
    contactPhone?: string;

    @IsOptional()
    @IsString()
    contactDesignation?: string;

    @IsOptional()
    @IsArray()
    perksAndBenefits?: string[];

    @IsOptional()
    @IsString()
    hiringProcess?: string;

    @IsOptional()
    remoteFriendly?: boolean;

    @IsOptional()
    @IsInt()
    teamSizeInTech?: number;

    @IsOptional()
    @IsArray()
    cultureHighlights?: string[];

    @IsOptional()
    @IsUrl()
    companyLogo?: string;

    @IsOptional()
    @IsUrl()
    bannerUrl?: string;
}
