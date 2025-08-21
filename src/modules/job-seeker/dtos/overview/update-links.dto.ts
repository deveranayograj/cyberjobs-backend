import { IsOptional, IsUrl } from 'class-validator';

export class UpdateLinksDto {
  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  personalWebsite?: string;
}
