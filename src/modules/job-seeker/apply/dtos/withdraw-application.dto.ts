// src/modules/job-seeker/apply/dtos/withdraw-application.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WithdrawApplicationDto {
  @IsNotEmpty()
  @IsNumber({}, { message: 'applicationId must be a number' })
  applicationId: bigint;
}