import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { CompanySize } from '@prisma/client';

export class CreateEmployerDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsEmail()
  contactEmail: string;

  @IsUrl()
  companyWebsite: string;

  @IsEnum(CompanySize)
  companySize: CompanySize;

  @IsNotEmpty()
  @IsString()
  contactName: string;
}
