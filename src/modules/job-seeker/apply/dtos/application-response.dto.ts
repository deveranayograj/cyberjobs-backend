import {
  ApplicationStatus,
  JobApplicationSource,
  JobPriority,
} from '@prisma/client';

export class ApplicationResponseDto {
  applicationId: bigint;
  jobId: bigint;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  source: JobApplicationSource;
  priority: JobPriority;
  appliedAt: Date;
  coverLetter?: string;
  resumeUrl?: string;
  stageHistory?: any;
}
