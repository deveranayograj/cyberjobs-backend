import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
    JobSeeker,
    JobSeekerResume,
    JobSeekerSkill,
    Experience,
    Education,
    Certification,
    Prisma,
} from '@prisma/client';

@Injectable()
export class JobSeekerRepository {
    constructor(private readonly prisma: PrismaService) { }

    /** ================= Profile ================= */
    async findByUserId(userId: bigint): Promise<
        JobSeeker & {
            user: any;
            skills: { skill: any }[];
            resumes: JobSeekerResume[];
            experiences: Experience[];
            education: Education[];
            certifications: Certification[];
        }
    > {
        const jobSeeker = await this.prisma.jobSeeker.findUnique({
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
        if (!jobSeeker) throw new NotFoundException('Job Seeker not found');
        return jobSeeker;
    }

    async update(userId: bigint, data: Prisma.JobSeekerUpdateInput): Promise<JobSeeker> {
        return this.prisma.jobSeeker.update({ where: { userId }, data });
    }

    /** ================= Resume ================= */
    async createResume(jobSeekerId: bigint, data: Partial<JobSeekerResume>): Promise<JobSeekerResume> {
        return this.prisma.jobSeekerResume.create({
            data: {
                jobSeekerId,
                url: data.url,
                fileName: data.fileName,
            },
        });
    }

    async deleteResume(jobSeekerId: bigint, resumeId: bigint): Promise<{ count: number }> {
        return this.prisma.jobSeekerResume.deleteMany({
            where: { jobSeekerId, id: resumeId },
        });
    }

    /** ================= Skills ================= */
    async addSkills(jobSeekerId: bigint, skillIds: bigint[]) {
        const data: Prisma.JobSeekerSkillUncheckedCreateInput[] = skillIds.map((skillId) => ({
            jobSeekerId,
            skillId,
        }));
        return this.prisma.jobSeekerSkill.createMany({ data, skipDuplicates: true });
    }

    async removeSkills(jobSeekerId: bigint, skillIds: bigint[]) {
        return this.prisma.jobSeekerSkill.deleteMany({
            where: { jobSeekerId, skillId: { in: skillIds } },
        });
    }

    /** ================= Experience ================= */
    async createExperience(
        jobSeekerId: bigint,
        data: Prisma.ExperienceUncheckedCreateInput,
    ): Promise<Experience> {
        return this.prisma.experience.create({ data: { jobSeekerId, ...data } });
    }

    async updateExperience(experienceId: bigint, data: Prisma.ExperienceUpdateInput): Promise<Experience> {
        return this.prisma.experience.update({ where: { id: experienceId }, data });
    }

    async deleteExperience(jobSeekerId: bigint, experienceId: bigint): Promise<{ count: number }> {
        return this.prisma.experience.deleteMany({
            where: { id: experienceId, jobSeekerId },
        });
    }

    /** ================= Education ================= */
    async createEducation(jobSeekerId: bigint, data: Prisma.EducationUncheckedCreateInput): Promise<Education> {
        return this.prisma.education.create({ data: { jobSeekerId, ...data } });
    }

    async updateEducation(educationId: bigint, data: Prisma.EducationUpdateInput): Promise<Education> {
        return this.prisma.education.update({ where: { id: educationId }, data });
    }

    async deleteEducation(jobSeekerId: bigint, educationId: bigint): Promise<{ count: number }> {
        return this.prisma.education.deleteMany({ where: { id: educationId, jobSeekerId } });
    }

    /** ================= Certification ================= */
    async createCertification(
        jobSeekerId: bigint,
        data: Prisma.CertificationUncheckedCreateInput,
    ): Promise<Certification> {
        return this.prisma.certification.create({ data: { jobSeekerId, ...data } });
    }

    async deleteCertification(jobSeekerId: bigint, certificationId: bigint): Promise<{ count: number }> {
        return this.prisma.certification.deleteMany({ where: { id: certificationId, jobSeekerId } });
    }
}
