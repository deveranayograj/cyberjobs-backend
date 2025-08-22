/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  JobSeeker,
  JobSeekerResume,
  JobSeekerSkill,
  Experience,
  Education,
  Certification,
} from '@prisma/client';

import { UpdateJobSeekerDto } from '@modules/job-seeker/dtos/overview/update-job-seeker.dto';
import { UpdateLinksDto } from '@modules/job-seeker/dtos/overview/update-links.dto';

import { AddSkillsDto } from '@modules/job-seeker/dtos/skills/add-skills.dto';
import { RemoveSkillsDto } from '@modules/job-seeker/dtos/skills/remove-skills.dto';

import { UploadResumeDto } from '@modules/job-seeker/dtos/resumes/upload-resume.dto';

import { AddExperienceDto } from '@modules/job-seeker/dtos/experience/add-experience.dto';
import { RemoveExperienceDto } from '@modules/job-seeker/dtos/experience/remove-experience.dto';
import { UpdateExperienceDto } from '@modules/job-seeker/dtos/experience/update-experience.dto';

import { AddEducationDto } from '@modules/job-seeker/dtos/education/add-education.dto';
import { RemoveEducationDto } from '@modules/job-seeker/dtos/education/remove-education.dto';
import { UpdateEducationDto } from '@modules/job-seeker/dtos/education/update-education.dto';

import { AddCertificationDto } from '@modules/job-seeker/dtos/certifications/add-certification.dto';
import { RemoveCertificationDto } from '@modules/job-seeker/dtos/certifications/remove-certification.dto';

@Injectable()
export class JobSeekerService {
  constructor(private readonly prisma: PrismaService) { }

  /** ================= Profile ================= */
  async getProfile(userId: bigint): Promise<
    JobSeeker & {
      user: any;
      skills: (JobSeekerSkill & { skill: { id: bigint; name: string } })[];
      resumes: JobSeekerResume[];
      experiences: Experience[];
      education: Education[];
      certifications: Certification[];
    }
  > {
    const profile = await this.prisma.jobSeeker.findUnique({
      where: { userId },
      include: {
        user: true,
        skills: { include: { skill: true } },
        resumes: true,
        experiences: true,
        education: true,
        certifications: true,
      },
    });

    if (!profile) throw new NotFoundException('Job Seeker profile not found');
    return profile;
  }

  /** ================= Overview ================= */
  async updateOverview(
    userId: bigint,
    dto: UpdateJobSeekerDto,
  ): Promise<JobSeeker> {
    try {
      return await this.prisma.jobSeeker.update({
        where: { userId },
        data: dto,
      });
    } catch (err) {
      console.error('Prisma error updating overview:', err);
      throw new InternalServerErrorException('Failed to update overview');
    }
  }

  async updateLinks(userId: bigint, dto: UpdateLinksDto): Promise<JobSeeker> {
    try {
      return await this.prisma.jobSeeker.update({
        where: { userId },
        data: dto,
      });
    } catch (err) {
      console.error('Failed to update links:', err);
      throw new InternalServerErrorException('Failed to update links');
    }
  }

  /** ================= Resume ================= */
  async uploadResume(
    userId: bigint,
    dto: UploadResumeDto,
  ): Promise<JobSeekerResume> {
    try {
      // 🔑 Correct mapping: jobSeeker.id is PK, not userId
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      return await this.prisma.jobSeekerResume.create({
        data: { jobSeekerId: jobSeeker.id, ...dto },
      });
    } catch (err) {
      console.error('Failed to upload resume:', err);
      throw new InternalServerErrorException('Failed to upload resume');
    }
  }

  async deleteResume(
    userId: bigint,
    resumeId: bigint,
  ): Promise<{ count: number }> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const deleted = await this.prisma.jobSeekerResume.deleteMany({
        where: { id: resumeId, jobSeekerId: jobSeeker.id },
      });
      return { count: deleted.count };
    } catch (err) {
      console.error('Failed to delete resume:', err);
      throw new InternalServerErrorException('Failed to delete resume');
    }
  }

  /** ================= Skills ================= */
  async addSkills(
    userId: bigint,
    dto: AddSkillsDto,
  ): Promise<{ count: number }> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const skillData = dto.skills.map((skillId) => ({
        jobSeekerId: jobSeeker.id,
        skillId,
      }));

      return await this.prisma.jobSeekerSkill.createMany({
        data: skillData,
        skipDuplicates: true,
      });
    } catch (err) {
      console.error('Failed to add skills:', err);
      throw new InternalServerErrorException('Failed to add skills');
    }
  }

  async removeSkills(
    userId: bigint,
    dto: RemoveSkillsDto,
  ): Promise<{ count: number }> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      return await this.prisma.jobSeekerSkill.deleteMany({
        where: { jobSeekerId: jobSeeker.id, skillId: { in: dto.skills } },
      });
    } catch (err) {
      console.error('Failed to remove skills:', err);
      throw new InternalServerErrorException('Failed to remove skills');
    }
  }

  /** ================= Experience ================= */
  async addExperience(
    userId: bigint,
    dto: AddExperienceDto,
  ): Promise<Experience> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      return await this.prisma.experience.create({
        data: {
          jobSeekerId: jobSeeker.id,
          company: dto.company,
          title: dto.title,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          description: dto.description,
        },
      });
    } catch (err) {
      console.error('Failed to add experience:', err);
      throw new InternalServerErrorException('Failed to add experience');
    }
  }

  async removeExperience(
    userId: bigint,
    dto: RemoveExperienceDto,
  ): Promise<{ count: number }> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const deleted = await this.prisma.experience.deleteMany({
        where: { id: dto.experienceId, jobSeekerId: jobSeeker.id },
      });
      return { count: deleted.count };
    } catch (err) {
      console.error('Failed to remove experience:', err);
      throw new InternalServerErrorException('Failed to remove experience');
    }
  }

  async updateExperience(
    userId: bigint,
    experienceId: bigint,
    dto: UpdateExperienceDto,
  ): Promise<Experience> {
    try {
      return await this.prisma.experience.update({
        where: { id: experienceId },
        data: {
          company: dto.company,
          title: dto.title,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          description: dto.description,
        },
      });
    } catch (err) {
      console.error('Failed to update experience:', err);
      throw new InternalServerErrorException('Failed to update experience');
    }
  }

  /** ================= Education ================= */
  async addEducation(userId: bigint, dto: AddEducationDto): Promise<Education> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      return await this.prisma.education.create({
        data: {
          jobSeekerId: jobSeeker.id,
          degree: dto.degree,
          institution: dto.institution,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          description: dto.description,
        },
      });
    } catch (err) {
      console.error('Failed to add education:', err);
      throw new InternalServerErrorException('Failed to add education');
    }
  }

  async removeEducation(
    userId: bigint,
    dto: RemoveEducationDto,
  ): Promise<{ count: number }> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const deleted = await this.prisma.education.deleteMany({
        where: { id: dto.educationId, jobSeekerId: jobSeeker.id },
      });
      return { count: deleted.count };
    } catch (err) {
      console.error('Failed to remove education:', err);
      throw new InternalServerErrorException('Failed to remove education');
    }
  }

  async updateEducation(
    userId: bigint,
    educationId: bigint,
    dto: UpdateEducationDto,
  ): Promise<Education> {
    try {
      return await this.prisma.education.update({
        where: { id: educationId },
        data: {
          degree: dto.degree,
          institution: dto.institution,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          description: dto.description,
        },
      });
    } catch (err) {
      console.error('Failed to update education:', err);
      throw new InternalServerErrorException('Failed to update education');
    }
  }

  /** ================= Certifications ================= */
  async addCertification(
    userId: bigint,
    dto: AddCertificationDto,
  ): Promise<Certification> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      return await this.prisma.certification.create({
        data: {
          jobSeekerId: jobSeeker.id,
          name: dto.name,
          organization: dto.organization,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : new Date(),
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          credentialId: dto.credentialId ?? null,
          credentialUrl: dto.credentialUrl ?? null,
        },
      });
    } catch (err) {
      console.error('Failed to add certification:', err);
      throw new InternalServerErrorException('Failed to add certification');
    }
  }

  async removeCertification(
    userId: bigint,
    dto: RemoveCertificationDto,
  ): Promise<{ count: number }> {
    try {
      const jobSeeker = await this.prisma.jobSeeker.findUnique({
        where: { userId },
      });
      if (!jobSeeker) throw new NotFoundException('Job Seeker not found');

      const deleted = await this.prisma.certification.deleteMany({
        where: { id: dto.certificationId, jobSeekerId: jobSeeker.id },
      });
      return { count: deleted.count };
    } catch (err) {
      console.error('Failed to remove certification:', err);
      throw new InternalServerErrorException('Failed to remove certification');
    }
  }
}
