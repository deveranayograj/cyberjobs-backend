import { IsNotEmpty, IsInt } from 'class-validator';

export class RemoveExperienceDto {
  @IsNotEmpty()
  @IsInt()
  experienceId: number;
}
