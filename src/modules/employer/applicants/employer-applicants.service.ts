import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ApplicantResponseDto } from './dtos/applicant-response.dto';
import { Prisma } from '@prisma/client';

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

    // ✅ Get applicants list (with filters)
    async getApplicantsForJob(
        userId: bigint,
        jobId: bigint,
        filters?: { status?: string; skill?: string; dateFrom?: string; dateTo?: string },
    ) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { employer: true },
        });

        if (!job) throw new NotFoundException('Job not found');
        if (job.employer.userId !== userId) throw new ForbiddenException('Unauthorized');

        const whereClause: any = { jobId };

        if (filters?.status) whereClause.status = filters.status;
        if (filters?.dateFrom || filters?.dateTo) {
            whereClause.appliedAt = {};
            if (filters.dateFrom) whereClause.appliedAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) whereClause.appliedAt.lte = new Date(filters.dateTo);
        }

        const applications = await this.prisma.jobApplication.findMany({
            where: whereClause,
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

        // skill filter in-memory
        let results = applications;
        if (filters?.skill) {
            results = applications.filter((app) =>
                app.jobSeeker.skills.some(
                    (s) => s.skill.name.toLowerCase() === filters.skill.toLowerCase(),
                ),
            );
        }

        return this.deepSerialize(
            results.map(
                (app) =>
                    new ApplicantResponseDto({
                        id: app.uniqueKey,
                        fullName: app.jobSeeker.user.fullName,
                        email: app.jobSeeker.user.email,
                        skills: app.jobSeeker.skills.map((s) => s.skill.name),
                        resumes: app.resume
                            ? [{ url: app.resume.url, fileName: app.resume.fileName }]
                            : app.jobSeeker.resumes.map((r) => ({
                                url: r.url,
                                fileName: r.fileName,
                            })),
                        score: undefined,
                        appliedAt: app.appliedAt,
                        status: app.status,
                    }),
            )
        );
    }

    // ✅ Get single application details
    async getApplicationDetails(userId: bigint, applicationId: bigint) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
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

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        return this.deepSerialize(application);
    }

    // ✅ Get stage history (from JSON field)
    async getApplicationHistory(userId: bigint, applicationId: bigint) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: { include: { employer: true } } },
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        return this.deepSerialize(application.stageHistory ?? []);
    }

    // ✅ Add or update note (using notes field)
    async addNoteToApplication(userId: bigint, applicationId: bigint, note: string) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: { include: { employer: true } } },
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        const updatedApp = await this.prisma.jobApplication.update({
            where: { id: applicationId },
            data: { notes: note },
        });

        return this.deepSerialize(updatedApp);
    }

    // ✅ Delete notes (set null in notes field)
    async deleteNotesFromApplication(userId: bigint, applicationId: bigint) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: { include: { employer: true } } },
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        const updatedApp = await this.prisma.jobApplication.update({
            where: { id: applicationId },
            data: { notes: null },
        });

        return this.deepSerialize({ message: 'Notes deleted successfully', application: updatedApp });
    }

    // ✅ Shortlist / Reject / Hire (update status + push to stageHistory JSON)
    async updateApplicationStatus(
        userId: bigint,
        applicationId: bigint,
        status: 'SHORTLISTED' | 'REJECTED' | 'HIRED',
    ) {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: { include: { employer: true } } },
        });

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        const existingHistory = Array.isArray(application.stageHistory)
            ? (application.stageHistory as { stage: string; changedAt: string }[])
            : [];

        const updatedHistory = [
            ...existingHistory,
            { stage: status, changedAt: new Date().toISOString() },
        ];

        const updatedApp = await this.prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status,
                stageHistory: updatedHistory as unknown as Prisma.JsonValue,
            },
        });

        return this.deepSerialize(updatedApp);
    }
}
