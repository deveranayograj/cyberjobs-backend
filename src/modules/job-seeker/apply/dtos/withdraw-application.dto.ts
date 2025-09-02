// src/modules/job-seeker/apply/dtos/withdraw-application.dto.ts
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class WithdrawApplicationDto {
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value))
  applicationId: bigint;
}
