import { IsNotEmpty, IsInt } from 'class-validator';

export class DeleteResumeDto {
  @IsNotEmpty()
  @IsInt()
  resumeId: number;
}
