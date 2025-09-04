// src/modules/jobs/employer/job.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JobRepository } from './job.repository';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { ChangeJobStatusDto } from './dtos/change-status.dto';
import { deepSerialize } from '@app/shared/utils/serialize.util';
import {
  Prisma,
  Job,
  QuestionType,
  EmployerOnboardingStep,
  JobStatus,
} from '@prisma/client';

@Injectable()
export class JobService {
  constructor(private readonly repo: JobRepository) { }

  /** ================= Serializer wrapper ================= */
  private serialize(obj: any) {
    return deepSerialize(obj);
  }

  /** ================= Create Job ================= */
  async createJob(userId: bigint, dto: CreateJobDto): Promise<Job> {
    try {
      const employer = await this.repo.findEmployerByUserId(userId);
      if (!employer) throw new NotFoundException('Employer profile not found');

      if (employer.onboardingStep !== EmployerOnboardingStep.VERIFIED) {
        throw new UnauthorizedException(
          'Complete company setup & KYC before creating jobs',
        );
      }

      const jobCategoryConnect = dto.jobCategoryId
        ? { connect: { id: BigInt(dto.jobCategoryId) } }
        : undefined;
      const locationConnect = dto.locationId
        ? { connect: { id: BigInt(dto.locationId) } }
        : undefined;

      const slug = `${dto.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')}-${Date.now()}`;

      const jobData: Prisma.JobCreateInput = {
        title: dto.title,
        slug,
        employer: { connect: { id: employer.id } }, // ✅ employerId resolved
        industry: dto.industry,
        workMode: dto.workMode,
        employmentType: dto.employmentType,
        experience: dto.experience,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryType: dto.salaryType,
        currency: dto.currency,
        validTill: new Date(dto.validTill),
        description: dto.description,
        requirements: dto.requirements,
        responsibilities: dto.responsibilities,
        benefits: dto.benefits,
        educationLevel: dto.educationLevel ?? '',
        tags: dto.tags ?? [],
        technologies: dto.technologies ?? [],
        certifications: dto.certifications ?? [],
        clearanceRequired: dto.clearanceRequired ?? false,
        applyType: dto.applyType,
        applyUrl: dto.applyUrl,
        applicationEmail: dto.applicationEmail,
        applicationLimit: dto.applicationLimit,
        isFeatured: dto.isFeatured ?? false,
        isUrgent: dto.isUrgent ?? false,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        status: (dto.status ?? JobStatus.DRAFT) as JobStatus,
        JobCategory: jobCategoryConnect,
        location: locationConnect,
      };

      let questions;
      if (dto.screeningQuestions?.length) {
        questions = dto.screeningQuestions.map((q) => ({
          question: q.question,
          type: q.type as QuestionType,
          options: q.options ?? [],
          required: q.required ?? false,
        }));
      }

      const job = await this.repo.createJob(jobData, questions);
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to create job:', err);

      if (err instanceof NotFoundException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to create job');
    }
  }

  /** ================= Update Job ================= */
  /** ================= Update Job ================= */
  async updateJob(jobId: bigint, userId: bigint, dto: UpdateJobDto): Promise<Job> {
    try {
      const employer = await this.repo.findEmployerByUserId(userId);
      if (!employer) throw new NotFoundException('Employer profile not found');

      const data: Prisma.JobUpdateInput = {};

      if (dto.jobCategoryId) {
        data.JobCategory = { connect: { id: BigInt(dto.jobCategoryId) } };
      }
      if (dto.locationId) {
        data.location = { connect: { id: BigInt(dto.locationId) } };
      }
      if (dto.screeningQuestions) {
        data.screeningQuestions = {
          deleteMany: {},
          create: dto.screeningQuestions.map((q) => ({
            question: q.question,
            type: q.type as QuestionType,
            options: q.options ?? [],
            required: q.required ?? false,
          })),
        };
      }

      // 🔥 If title is being updated, regenerate slug
      if (dto.title) {
        const newSlug = `${dto.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')}-${Date.now()}`;

        data.slug = newSlug;
      }

      for (const key of Object.keys(dto)) {
        if (!['jobCategoryId', 'locationId', 'screeningQuestions', 'title'].includes(key)) {
          (data as any)[key] = (dto as any)[key];
        }
      }

      const job = await this.repo.updateJob(jobId, employer.id, data);
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to update job:', err);

      if (err instanceof NotFoundException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to update job');
    }
  }


  /** ================= Change Job Status ================= */
  async changeStatus(jobId: bigint, userId: bigint, dto: ChangeJobStatusDto): Promise<Job> {
    try {
      const employer = await this.repo.findEmployerByUserId(userId);
      if (!employer) throw new NotFoundException('Employer profile not found');

      const job = await this.repo.changeJobStatus(jobId, employer.id, dto.status as JobStatus);
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to change job status:', err);

      if (err instanceof NotFoundException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to change job status');
    }
  }

  /** ================= Get Jobs by Employer ================= */
  async getJobsByEmployer(userId: bigint): Promise<any[]> {
    try {
      const employer = await this.repo.findEmployerByUserId(userId);
      if (!employer) throw new NotFoundException('Employer profile not found');

      console.log(`[Service] Resolved EmployerId: ${employer.id} for UserId: ${userId}`);
      const jobs: Job[] = await this.repo.listEmployerJobs(employer.id);

      console.log(`[Service] Jobs fetched: ${jobs.length}`);
      return deepSerialize(jobs);
    } catch (err) {
      console.error('Failed to fetch jobs for employer:', err);

      if (err instanceof NotFoundException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch jobs for employer');
    }
  }

  /** ================= Get Job by ID ================= */
  async getJob(jobId: bigint, userId: bigint): Promise<any> {
    try {
      const employer = await this.repo.findEmployerByUserId(userId);
      if (!employer) throw new NotFoundException('Employer profile not found');

      const job: Job | null = await this.repo.findJobById(jobId, employer.id);
      if (!job) throw new NotFoundException('Job not found');

      console.log(`[Service] Job fetched: ${job.title} (EmployerId: ${job.employerId})`);
      return deepSerialize(job);
    } catch (err) {
      console.error('Failed to fetch job:', err);

      if (err instanceof NotFoundException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch job');
    }
  }
}
