import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class RemoveSkillsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  skills: number[];
}
