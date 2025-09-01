// src/modules/employer/applicants/employer-applicants.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ApplicantResponseDto } from './dtos/applicant-response.dto';

@Injectable()
export class EmployerApplicantsService {
    constructor(private readonly prisma: PrismaService) { }

    private deepSerialize(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return obj.toString();
        if (Array.isArray(obj)) return obj.map((i) => this.deepSerialize(i));
        if (typeof obj === 'object') {
            const res: Record<string, any> = {};
            for (const key in obj) res[key] = this.deepSerialize(obj[key]);
            return res;
        }
        return obj;
    }

    // src/modules/employer/applicants/employer-applicants.service.ts
    async getApplicantsForJob(userId: bigint, jobId: bigint) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { employer: true },
        });

        if (!job) throw new NotFoundException('Job not found');
        if (job.employer.userId !== userId) throw new ForbiddenException('Unauthorized');

        const applications = await this.prisma.jobApplication.findMany({
            where: { jobId },
            include: {
                jobSeeker: {
                    include: {
                        user: true,
                        skills: { include: { skill: true } },
                        resumes: true, // 👈 get all resumes
                    },
                },
                resume: true, // 👈 specific resume used for this job application
            },
            orderBy: { appliedAt: 'desc' },
        });

        return applications.map(
            (app) =>
                new ApplicantResponseDto({
                    id: app.uniqueKey,
                    fullName: app.jobSeeker.user.fullName,
                    email: app.jobSeeker.user.email,
                    skills: app.jobSeeker.skills.map((s) => s.skill.name),
                    resumes: app.resume
                        ? [{ url: app.resume.url, fileName: app.resume.fileName }] // if specific resume used
                        : app.jobSeeker.resumes.map((r) => ({
                            url: r.url,
                            fileName: r.fileName,
                        })), // fallback: all resumes
                    score: undefined,
                    appliedAt: app.appliedAt,
                    status: app.status,
                }),
        );
    }



}
