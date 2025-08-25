import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';

@Injectable()
export class ApplyService {
  constructor(private readonly prisma: PrismaService) {}

  async applyJob(userId: bigint, dto: ApplyJobDto) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
    if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
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
        resumeId: dto.resumeId,
        coverLetter: dto.coverLetter,
        source: dto.source,
        stageHistory: [{ status: 'APPLIED', date: new Date() }],
      },
      include: {
        job: {
          select: { title: true, employer: { select: { companyName: true } } },
        },
      },
    });

    await this.prisma.job.update({
      where: { id: job.id },
      data: { applicationsCount: { increment: 1 } },
    });

    return application;
  }

  async withdrawApplication(userId: bigint, dto: WithdrawApplicationDto) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
    if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

    const application = await this.prisma.jobApplication.findUnique({
      where: { id: dto.applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.jobSeekerId !== jobSeeker.id)
      throw new BadRequestException('Not authorized');

    const updated = await this.prisma.jobApplication.update({
      where: { id: dto.applicationId },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
        stageHistory: [
          ...(application.stageHistory || []),
          { status: 'WITHDRAWN', date: new Date() },
        ],
      },
    });

    return updated;
  }

  async listApplications(userId: bigint) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
    if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

    const applications = await this.prisma.jobApplication.findMany({
      where: { jobSeekerId: jobSeeker.id },
      include: {
        job: {
          select: { title: true, employer: { select: { companyName: true } } },
        },
        resume: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    return applications.map((a) => ({
      applicationId: a.id,
      jobId: a.jobId,
      jobTitle: a.job.title,
      companyName: a.job.employer.companyName,
      status: a.status,
      source: a.source,
      priority: a.priority,
      appliedAt: a.appliedAt,
      coverLetter: a.coverLetter,
      resumeUrl: a.resume?.url,
      stageHistory: a.stageHistory,
    }));
  }

  async getApplication(userId: bigint, applicationId: bigint) {
    const jobSeeker = await this.prisma.jobSeeker.findUnique({
      where: { userId },
    });
    if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: { include: { employer: true } },
        resume: true,
        answers: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.jobSeekerId !== jobSeeker.id)
      throw new BadRequestException('Not authorized');

    return application;
  }
}
