import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApplyRepository } from './apply.repository';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';
import { JobApplicationSource } from '@prisma/client';

@Injectable()
export class ApplyService {
  constructor(private readonly repo: ApplyRepository) { }

  /** ================= Apply to a Job ================= */
  async applyJob(userId: bigint, dto: ApplyJobDto) {
    try {
      const jobSeeker = await this.repo.findJobSeeker(userId);
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const jobId = BigInt(dto.jobId);
      const resumeId = dto.resumeId ? BigInt(dto.resumeId) : undefined;

      const job = await this.repo.findJob(jobId);
      if (!job) throw new NotFoundException('Job not found');
      if (job.applicationLimit && job.applicationsCount >= job.applicationLimit) {
        throw new BadRequestException('Application limit reached for this job');
      }

      const existingApplication = await this.repo.findExistingApplication(jobSeeker.id, jobId);
      if (existingApplication) throw new BadRequestException('Already applied to this job');

      const answersData =
        dto.answers && dto.answers.length
          ? dto.answers.map(a => {
            const questionExists = job.screeningQuestions.some(q => q.id === BigInt(a.questionId));
            if (!questionExists) throw new BadRequestException(`Invalid questionId: ${a.questionId}`);
            return { questionId: BigInt(a.questionId), answer: a.answer };
          })
          : undefined;

      const application = await this.repo.createApplication({
        jobId,
        jobSeekerId: jobSeeker.id,
        resumeId,
        coverLetter: dto.coverLetter,
        source: dto.source ?? JobApplicationSource.DIRECT,
        answers: answersData,
      });

      await this.repo.incrementJobApplications(jobId);
      return application;
    } catch (err) {
      this.handleError(err, 'Failed to apply to job');
    }
  }

  /** ================= Withdraw Application ================= */
  async withdrawApplication(userId: bigint, dto: WithdrawApplicationDto) {
    try {
      const jobSeeker = await this.repo.findJobSeeker(userId);
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const applicationId = BigInt(dto.applicationId);
      const application = await this.repo.findApplicationById(jobSeeker.id, applicationId);
      if (!application) throw new NotFoundException('Application not found');
      if (application.status === 'WITHDRAWN') throw new BadRequestException('Application is already withdrawn');

      const updated = await this.repo.withdrawApplication(application);
      await this.repo.decrementJobApplications(application.jobId);
      return updated;
    } catch (err) {
      this.handleError(err, 'Failed to withdraw application');
    }
  }

  /** ================= List Applications ================= */
  async listApplications(userId: bigint) {
    try {
      const jobSeeker = await this.repo.findJobSeeker(userId);
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      return this.repo.findApplications(jobSeeker.id);
    } catch (err) {
      this.handleError(err, 'Failed to list applications');
    }
  }

  /** ================= Get Application by ID ================= */
  async getApplication(userId: bigint, applicationId: bigint) {
    try {
      const jobSeeker = await this.repo.findJobSeeker(userId);
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const application = await this.repo.findApplicationById(jobSeeker.id, applicationId);
      if (!application) throw new NotFoundException('Application not found');

      return application;
    } catch (err) {
      this.handleError(err, 'Failed to get application');
    }
  }

  /** ================= Centralized Error Handling ================= */
  private handleError(err: any, msg: string): never {
    if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
    console.error(msg, err);
    throw new InternalServerErrorException(msg);
  }
}
