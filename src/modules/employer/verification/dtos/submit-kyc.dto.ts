import { IsOptional, IsString, IsArray } from 'class-validator';

export class SubmitKycDto {
  @IsOptional()
  @IsString()
  panCardUrl?: string;

  @IsOptional()
  @IsString()
  incorporationCertUrl?: string;

  @IsOptional()
  @IsString()
  gstCertUrl?: string;

  @IsOptional()
  @IsArray()
  otherDocs?: string[];
}
