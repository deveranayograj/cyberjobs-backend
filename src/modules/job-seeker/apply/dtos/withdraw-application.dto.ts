import { IsNotEmpty, IsBigInt } from 'class-validator';

export class WithdrawApplicationDto {
  @IsNotEmpty()
  applicationId: bigint;
}
