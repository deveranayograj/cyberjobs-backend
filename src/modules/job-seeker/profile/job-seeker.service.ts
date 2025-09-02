import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JobSeekerRepository } from './job-seeker.repository';
import { UpdateJobSeekerDto, UpdateLinksDto } from './dtos';
import {
  AddSkillsDto,
  RemoveSkillsDto,
  UploadResumeDto,
  AddExperienceDto,
  UpdateExperienceDto,
  RemoveExperienceDto,
  AddEducationDto,
  UpdateEducationDto,
  RemoveEducationDto,
  AddCertificationDto,
  RemoveCertificationDto,
} from './dtos';

@Injectable()
export class JobSeekerService {
  constructor(private readonly repo: JobSeekerRepository) { }

  /** ================= Helper ================= */
  private async getJobSeekerOrFail(userId: bigint) {
    const jobSeeker = await this.repo.findByUserId(userId);
    if (!jobSeeker) throw new NotFoundException('Job Seeker not found');
    return jobSeeker;
  }

  /** ================= Profile ================= */
  async getProfile(userId: bigint) {
    return this.getJobSeekerOrFail(userId);
  }

  async updateOverview(userId: bigint, dto: UpdateJobSeekerDto) {
    try {
      return await this.repo.update(userId, dto);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update overview');
    }
  }

  async updateLinks(userId: bigint, dto: UpdateLinksDto) {
    try {
      return await this.repo.update(userId, dto);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update links');
    }
  }

  /** ================= Resume ================= */
  async uploadResume(userId: bigint, dto: UploadResumeDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.createResume(jobSeeker.id, {
      ...dto,
      jobSeekerId: jobSeeker.id,
    });
  }

  async deleteResume(userId: bigint, resumeId: bigint) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.deleteResume(jobSeeker.id, resumeId);
  }

  /** ================= Skills ================= */
  async addSkills(userId: bigint, dto: AddSkillsDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.addSkills(jobSeeker.id, dto.skills.map((s) => BigInt(s)));
  }

  async removeSkills(userId: bigint, dto: RemoveSkillsDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.removeSkills(jobSeeker.id, dto.skills.map((s) => BigInt(s)));
  }

  /** ================= Experience ================= */
  async addExperience(userId: bigint, dto: AddExperienceDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.createExperience(jobSeeker.id, {
      jobSeekerId: jobSeeker.id,
      company: dto.company,
      title: dto.title,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      description: dto.description ?? undefined,
    });
  }

  async updateExperience(experienceId: bigint, dto: UpdateExperienceDto) {
    return this.repo.updateExperience(experienceId, {
      company: dto.company,
      title: dto.title,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      description: dto.description ?? undefined,
    });
  }

  async removeExperience(userId: bigint, dto: RemoveExperienceDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.deleteExperience(jobSeeker.id, BigInt(dto.experienceId));
  }

  /** ================= Education ================= */
  async addEducation(userId: bigint, dto: AddEducationDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.createEducation(jobSeeker.id, {
      jobSeekerId: jobSeeker.id,
      institution: dto.institution,
      degree: dto.degree,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      description: dto.description ?? undefined,
    });
  }

  async updateEducation(educationId: bigint, dto: UpdateEducationDto) {
    return this.repo.updateEducation(educationId, {
      institution: dto.institution,
      degree: dto.degree,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      description: dto.description ?? undefined,
    });
  }

  async removeEducation(userId: bigint, dto: RemoveEducationDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.deleteEducation(jobSeeker.id, dto.educationId);
  }

  /** ================= Certification ================= */
  async addCertification(userId: bigint, dto: AddCertificationDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.createCertification(jobSeeker.id, {
      jobSeekerId: jobSeeker.id,
      name: dto.name,
      organization: dto.organization ?? undefined,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      credentialId: dto.credentialId ?? undefined,
      credentialUrl: dto.credentialUrl ?? undefined,
    });
  }

  async removeCertification(userId: bigint, dto: RemoveCertificationDto) {
    const jobSeeker = await this.getJobSeekerOrFail(userId);
    return this.repo.deleteCertification(jobSeeker.id, BigInt(dto.certificationId));
  }
}
