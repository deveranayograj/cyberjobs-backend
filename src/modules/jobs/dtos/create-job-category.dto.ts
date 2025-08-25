import { IsString } from 'class-validator';

export class CreateJobCategoryDto {
  @IsString()
  main: string;

  @IsString()
  sub: string;
}
