import { IsEnum } from 'class-validator';
import { JobStatusEnum } from '@modules/jobs/employer/enums/job-status.enum';

export class ChangeJobStatusDto {
  @IsEnum(JobStatusEnum)
  status: JobStatusEnum;
}
