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

      const jobId = BigInt(dto.jobId);
      const resumeId = dto.resumeId ? BigInt(dto.resumeId) : undefined;

      const job = await this.prisma.job.findUnique({
        where: { id: jobId },
        include: { screeningQuestions: true },
      });
      if (!job) throw new NotFoundException('Job not found');

      if (job.applicationLimit && job.applicationsCount >= job.applicationLimit) {
        throw new BadRequestException('Application limit reached for this job');
      }

      const existingApplication = await this.prisma.jobApplication.findFirst({
        where: {
          jobId,
          jobSeekerId: jobSeeker.id,
          NOT: { status: 'WITHDRAWN' },
        },
      });
      if (existingApplication)
        throw new BadRequestException('Already applied to this job');

      const answersData = dto.answers?.map(a => {
        const questionExists = job.screeningQuestions.some(
          q => q.id === BigInt(a.questionId),
        );
        if (!questionExists)
          throw new BadRequestException(`Invalid questionId: ${a.questionId}`);
        return { questionId: BigInt(a.questionId), answer: a.answer };
      });

      const application = await this.prisma.jobApplication.create({
        data: {
          jobId,
          jobSeekerId: jobSeeker.id,
          resumeId,
          coverLetter: dto.coverLetter,
          source: dto.source,
          appliedAt: new Date(),
          stageHistory: [{ status: 'APPLIED', date: new Date().toISOString() }],
          answers: answersData ? { create: answersData } : undefined,
        },
        include: {
          job: {
            select: {
              title: true,
              employer: { select: { companyName: true } },
            },
          },
          answers: true,
        },
      });

      await this.prisma.job.update({
        where: { id: jobId },
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

      const application = await this.prisma.jobApplication.findFirst({
        where: { id: applicationId, jobSeekerId: jobSeeker.id },
      });

      if (!application) throw new NotFoundException('Application not found');
      if (application.status === 'WITHDRAWN')
        throw new BadRequestException('Application is already withdrawn');

      const updated = await this.prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: 'WITHDRAWN',
          withdrawnAt: new Date(),
          stageHistory: [
            ...(Array.isArray(application.stageHistory)
              ? application.stageHistory
              : []),
            { status: 'WITHDRAWN', date: new Date().toISOString() },
          ],
        },
      });

      await this.prisma.job.update({
        where: { id: application.jobId },
        data: { applicationsCount: { decrement: 1 } },
      });

      return updated;
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to withdraw application');
    }
  }

  /** ================= List Applications ================= */
  /** ================= List Applications ================= */
  async listApplications(userId: bigint) {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });

      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const applications = await this.prisma.jobApplication.findMany({
        where: { jobSeekerId: jobSeeker.id },
        include: {
          job: {
            select: {
              title: true,
              employer: { select: { companyName: true } },
            },
          },
          answers: true,
        },
        orderBy: { appliedAt: 'desc' },
      });

      return applications;
    } catch (err) {
      console.error('Failed to list applications:', err);
      throw new InternalServerErrorException('Failed to list applications');
    }
  }


  /** ================= Get Application by ID ================= */
  async getApplication(userId: bigint, applicationId: bigint) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });

    if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, jobSeekerId: jobSeeker.id },
      include: {
        job: {
          select: {
            title: true,
            employer: { select: { companyName: true } },
          },
        },
        answers: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    return application;
  }

}
