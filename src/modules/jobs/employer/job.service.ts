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
import { Prisma, Job, QuestionType, EmployerOnboardingStep, JobStatus } from '@prisma/client';

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
      // Validate employer (fetch jobs to validate existence)
      const employerJobs = await this.repo.listEmployerJobs(userId);
      if (!employerJobs) throw new NotFoundException('Employer profile not found');

      // TODO: Replace with actual employer verification check
      if ((employerJobs as any)[0]?.employer?.onboardingStep !== EmployerOnboardingStep.VERIFIED) {
        throw new UnauthorizedException('Complete company setup & KYC before creating jobs');
      }

      const jobCategoryConnect = dto.jobCategoryId
        ? { connect: { id: BigInt(dto.jobCategoryId) } }
        : undefined;
      const locationConnect = dto.locationId
        ? { connect: { id: BigInt(dto.locationId) } }
        : undefined;

      const slug = `${dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}-${Date.now()}`;

      const jobData: Prisma.JobCreateInput = {
        title: dto.title,
        slug,
        employer: { connect: { id: userId } }, // userId = employerId
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

      // Add screening questions
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
      throw new InternalServerErrorException('Failed to create job');
    }
  }

  /** ================= Update Job ================= */
  async updateJob(jobId: bigint, employerId: bigint, dto: UpdateJobDto): Promise<Job> {
    try {
      const data: Prisma.JobUpdateInput = {};

      if (dto.jobCategoryId) data.JobCategory = { connect: { id: BigInt(dto.jobCategoryId) } };
      if (dto.locationId) data.location = { connect: { id: BigInt(dto.locationId) } };

      // Replace all screening questions if provided
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

      // Copy other fields
      for (const key of Object.keys(dto)) {
        if (!['jobCategoryId', 'locationId', 'screeningQuestions'].includes(key)) {
          (data as any)[key] = (dto as any)[key];
        }
      }

      // Update job
      const job = await this.repo.updateJob(jobId, employerId, data);
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to update job:', err);
      throw new InternalServerErrorException('Failed to update job');
    }
  }

  /** ================= Change Job Status ================= */
  async changeStatus(jobId: bigint, employerId: bigint, dto: ChangeJobStatusDto): Promise<Job> {
    try {
      const job = await this.repo.changeJobStatus(jobId, employerId, dto.status as JobStatus);
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to change job status:', err);
      throw new InternalServerErrorException('Failed to change job status');
    }
  }

  /** ================= Get Jobs by Employer ================= */
  async getJobsByEmployer(employerId: bigint): Promise<Job[]> {
    const jobs = await this.repo.listEmployerJobs(employerId);
    return this.serialize(jobs);
  }

  /** ================= Get Job by ID ================= */
  async getJob(jobId: bigint, employerId: bigint): Promise<Job> {
    const job = await this.repo.findJobById(jobId, employerId);
    if (!job) throw new NotFoundException('Job not found');
    return this.serialize(job);
  }
}
