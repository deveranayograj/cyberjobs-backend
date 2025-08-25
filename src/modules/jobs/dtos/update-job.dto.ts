import { PartialType } from '@nestjs/swagger';

import { CreateJobDto } from './create-job.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateJobDto extends PartialType(CreateJobDto) {}
