/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';

@Injectable()
export class ApplyService {
  constructor(private readonly prisma: PrismaService) { }

  /** ================= Apply to a Job ================= */
  async applyJob(userId: bigint, dto: ApplyJobDto) {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const job = await this.prisma.job.findUnique({
        where: { id: dto.jobId },
      });
      if (!job) throw new NotFoundException('Job not found');

      if (job.applicationLimit && job.applicationsCount >= job.applicationLimit) {
        throw new BadRequestException('Application limit reached for this job');
      }

      const existingApplication = await this.prisma.jobApplication.findFirst({
        where: { jobId: dto.jobId, jobSeekerId: jobSeeker.id },
      });
      if (existingApplication)
        throw new BadRequestException('Already applied to this job');

      const application = await this.prisma.jobApplication.create({
        data: {
          jobId: dto.jobId,
          jobSeekerId: jobSeeker.id,
          resumeId: dto.resumeId ? BigInt(dto.resumeId) : undefined,
          coverLetter: dto.coverLetter,
          source: dto.source,
          stageHistory: [{ status: 'APPLIED', date: new Date() }],
        },
        include: {
          job: { select: { title: true, employer: { select: { companyName: true } } } },
        },
      });

      await this.prisma.job.update({
        where: { id: job.id },
        data: { applicationsCount: { increment: 1 } },
      });

      return application;
    } catch (err) {
      console.error('Failed to apply to job:', err);
      throw new InternalServerErrorException('Failed to apply to job');
    }
  }

  /** ================= Withdraw Application ================= */
  async withdrawApplication(userId: bigint, dto: WithdrawApplicationDto) {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const applicationId = BigInt(dto.applicationId);
      const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
      });
      if (!application) throw new NotFoundException('Application not found');
      if (application.jobSeekerId !== jobSeeker.id)
        throw new BadRequestException('Not authorized');

      return await this.prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: 'WITHDRAWN',
          withdrawnAt: new Date(),
          stageHistory: [
            ...(Array.isArray(application.stageHistory)
              ? application.stageHistory
              : []),
            { status: 'WITHDRAWN', date: new Date() },
          ],
        },
      });
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      throw new InternalServerErrorException('Failed to withdraw application');
    }
  }

  /** ================= List Applications ================= */
  async listApplications(userId: bigint) {
    try {
      return await this.prisma.jobApplication.findMany({
        where: { jobSeekerId: userId },
        include: {
          job: { select: { title: true, employer: { select: { companyName: true } } } },
        },
        orderBy: { appliedAt: 'desc' },
      });
    } catch (err) {
      console.error('Failed to list applications:', err);
      throw new InternalServerErrorException('Failed to list applications');
    }
  }

  /** ================= Get Application by ID ================= */
  async getApplication(userId: bigint, applicationId: bigint) {
    try {
      const application = await this.prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          job: { select: { title: true, employer: { select: { companyName: true } } } },
        },
      });

      if (!application || application.jobSeekerId !== userId)
        throw new NotFoundException('Application not found');

      return application;
    } catch (err) {
      console.error('Failed to fetch application:', err);
      throw new InternalServerErrorException('Failed to fetch application');
    }
  }
}
