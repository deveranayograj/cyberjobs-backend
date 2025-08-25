import { IsEnum } from 'class-validator';
import { JobStatusEnum } from '../enums/job-status.enum';

export class ChangeJobStatusDto {
  @IsEnum(JobStatusEnum)
  status: JobStatusEnum;
}
