import { IsOptional, IsString } from 'class-validator';

export class UpdateJobSeekerDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
