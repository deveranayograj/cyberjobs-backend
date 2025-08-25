import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Job, JobStatus, Prisma, EmployerOnboardingStep, QuestionType } from '@prisma/client';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { ChangeJobStatusDto } from './dtos/change-status.dto';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) { }

  /** ================= Serializer for BigInt & Date ================= */
  private serialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map((item) => this.serialize(item));
    if (typeof obj === 'object') {
      const res: Record<string, any> = {};
      for (const key in obj) {
        res[key] = this.serialize(obj[key]);
      }
      return res;
    }
    return obj;
  }

  /** ================= Create Job ================= */
  async createJob(userId: bigint, dto: CreateJobDto): Promise<Job> {
    try {
      const employer = await this.prisma.employer.findUnique({ where: { userId } });
      if (!employer) throw new NotFoundException('Employer profile not found');

      if (employer.onboardingStep !== EmployerOnboardingStep.VERIFIED) {
        throw new UnauthorizedException(
          'Complete your company setup and KYC verification before creating jobs',
        );
      }

      // Type validations
      if ((dto.applyType === 'DIRECT' || dto.applyType === 'EXTERNAL') && !dto.applyUrl) {
        throw new InternalServerErrorException('applyUrl is required for this applyType');
      }

      if (dto.applyType !== 'PRE_SCREENING') {
        dto.screeningQuestions = undefined; // ignore if not PRE_SCREENING
      }

      const slug = `${dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}-${Date.now()}`;

      let jobCategoryConnect: Prisma.JobCategoryCreateNestedOneWithoutJobsInput | undefined;
      if (dto.jobCategoryId) {
        const category = await this.prisma.jobCategory.findUnique({ where: { id: BigInt(dto.jobCategoryId) } });
        if (!category) throw new NotFoundException('Job category not found');
        jobCategoryConnect = { connect: { id: category.id } };
      }

      let locationConnect: Prisma.JobLocationCreateNestedOneWithoutJobsInput | undefined;
      if (dto.locationId) {
        const location = await this.prisma.jobLocation.findUnique({ where: { id: BigInt(dto.locationId) } });
        if (!location) throw new NotFoundException('Job location not found');
        locationConnect = { connect: { id: location.id } };
      }

      const job = await this.prisma.job.create({
        data: {
          slug,
          employer: { connect: { id: employer.id } },
          title: dto.title,
          industry: dto.industry,
          workMode: dto.workMode,
          employmentType: dto.employmentType,
          experience: dto.experience,
          salaryMin: dto.salaryMin,
          salaryMax: dto.salaryMax,
          salaryType: dto.salaryType,
          currency: dto.currency,
          validTill: dto.validTill,
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
          status: dto.status ?? JobStatus.DRAFT,
          JobCategory: jobCategoryConnect,
          location: locationConnect,
          screeningQuestions: dto.screeningQuestions
            ? {
              create: dto.screeningQuestions.map((q) => ({
                question: q.question,
                type: q.type as QuestionType,
                options: q.options ?? [],
                required: q.required ?? false,
              })),
            }
            : undefined,
        },
      });

      return this.serialize(job);
    } catch (err) {
      console.error('Failed to create job:', err);
      throw new InternalServerErrorException('Failed to create job');
    }
  }

  /** ================= Update Job ================= */
  async updateJob(jobId: bigint, dto: UpdateJobDto): Promise<Job> {
    try {
      if ((dto.applyType === 'DIRECT' || dto.applyType === 'EXTERNAL') && !dto.applyUrl) {
        throw new InternalServerErrorException('applyUrl is required for this applyType');
      }

      if (dto.applyType !== 'PRE_SCREENING') {
        dto.screeningQuestions = undefined;
      }

      const data: Prisma.JobUpdateInput = {};

      for (const key of Object.keys(dto)) {
        if (key === 'jobCategoryId' && dto[key] !== undefined) {
          const category = await this.prisma.jobCategory.findUnique({ where: { id: BigInt(dto[key]) } });
          if (!category) throw new NotFoundException('Job category not found');
          data.JobCategory = { connect: { id: category.id } };
        } else if (key === 'locationId' && dto[key] !== undefined) {
          const location = await this.prisma.jobLocation.findUnique({ where: { id: BigInt(dto[key]) } });
          if (!location) throw new NotFoundException('Job location not found');
          data.location = { connect: { id: location.id } };
        } else if (key === 'screeningQuestions' && dto[key]) {
          data.screeningQuestions = {
            deleteMany: {},
            create: dto.screeningQuestions.map((q) => ({
              question: q.question,
              type: q.type as QuestionType,
              options: q.options ?? [],
              required: q.required ?? false,
            })),
          };
        } else if (key === 'status' && dto[key] !== undefined) {
          data.status = dto[key];
        } else if (key !== 'jobCategoryId' && key !== 'locationId') {
          data[key] = dto[key];
        }
      }

      const job = await this.prisma.job.update({ where: { id: jobId }, data });
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to update job:', err);
      throw new InternalServerErrorException('Failed to update job');
    }
  }

  /** ================= Change Job Status ================= */
  async changeStatus(jobId: bigint, dto: ChangeJobStatusDto): Promise<Job> {
    try {
      const job = await this.prisma.job.update({ where: { id: jobId }, data: { status: dto.status } });
      return this.serialize(job);
    } catch (err) {
      console.error('Failed to change job status:', err);
      throw new InternalServerErrorException('Failed to change job status');
    }
  }

  /** ================= Get Jobs by Employer ================= */
  async getJobsByEmployer(userId: bigint): Promise<Job[]> {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const jobs = await this.prisma.job.findMany({
      where: { employerId: employer.id },
      include: { screeningQuestions: true, JobCategory: true, location: true },
    });

    return this.serialize(jobs);
  }

  /** ================= Get Job by ID ================= */
  async getJob(jobId: bigint): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { screeningQuestions: true, JobCategory: true, location: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    return this.serialize(job);
  }
}
