import { IsNotEmpty, IsInt } from 'class-validator';

export class RemoveEducationDto {
  @IsNotEmpty()
  @IsInt()
  educationId: bigint;
}
