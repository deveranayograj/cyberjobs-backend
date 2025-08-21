import { IsNotEmpty, IsInt } from 'class-validator';

export class RemoveCertificationDto {
  @IsNotEmpty()
  @IsInt()
  certificationId: number;
}
