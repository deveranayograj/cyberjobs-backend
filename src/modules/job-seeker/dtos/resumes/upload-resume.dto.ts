import { IsNotEmpty, IsString } from 'class-validator';

export class UploadResumeDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;
}
