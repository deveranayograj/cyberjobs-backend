import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class AddSkillsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  skills: number[]; // Skill IDs
}
