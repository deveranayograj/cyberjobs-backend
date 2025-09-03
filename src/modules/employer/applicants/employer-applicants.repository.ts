import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployerApplicantsRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ✅ Find job by ID (with employer relation)
    async findJobById(jobId: bigint) {
        return this.prisma.job.findUnique({
            where: { id: jobId },
            include: { employer: true },
        });
    }

    // ✅ Find applications for an employer
    async findApplications(where: Prisma.JobApplicationWhereInput) {
        return this.prisma.jobApplication.findMany({
            where,
            include: {
                jobSeeker: {
                    include: {
                        user: true,
                        skills: { include: { skill: true } },
                        resumes: true,
                    },
                },
                resume: true,
            },
            orderBy: { appliedAt: 'desc' },
        });
    }

    // ✅ Find single application by ID
    async findApplicationById(id: bigint) {
        return this.prisma.jobApplication.findUnique({
            where: { id },
            include: {
                job: { include: { employer: true } },
                jobSeeker: {
                    include: {
                        user: true,
                        skills: { include: { skill: true } },
                        resumes: true,
                    },
                },
                resume: true,
            },
        });
    }

    // ✅ Update application status / notes
    async updateApplication(id: bigint, data: Prisma.JobApplicationUpdateInput) {
        return this.prisma.jobApplication.update({
            where: { id },
            data,
        });
    }
}
