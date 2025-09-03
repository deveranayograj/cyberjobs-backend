import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EmployerApplicantsRepository } from './employer-applicants.repository';
import { ApplicantResponseDto } from './dtos/applicant-response.dto';
import { Prisma } from '@prisma/client';
import { deepSerialize } from '@app/shared/utils/serialize.util';

@Injectable()
export class EmployerApplicantsService {
    constructor(private readonly repo: EmployerApplicantsRepository) { }

    // ✅ Get applicants list (with filters)
    async getApplicantsForJob(
        userId: bigint,
        jobId: bigint,
        filters?: { status?: string; skill?: string; dateFrom?: string; dateTo?: string },
    ) {
        const job = await this.repo.findJobById(jobId);

        if (!job) throw new NotFoundException('Job not found');
        if (job.employer.userId !== userId) throw new ForbiddenException('Unauthorized');

        const whereClause: Prisma.JobApplicationWhereInput = { jobId };

        if (filters?.status) whereClause.status = filters.status as any;
        if (filters?.dateFrom || filters?.dateTo) {
            whereClause.appliedAt = {};
            if (filters.dateFrom) whereClause.appliedAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) whereClause.appliedAt.lte = new Date(filters.dateTo);
        }

        const applications = await this.repo.findApplications(whereClause);

        // skill filter in-memory
        let results = applications;
        if (filters?.skill) {
            results = applications.filter((app) =>
                app.jobSeeker.skills.some(
                    (s) => s.skill.name.toLowerCase() === filters.skill!.toLowerCase(),
                ),
            );
        }

        return deepSerialize(
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
            ),
        );
    }

    // ✅ Get single application details
    async getApplicationDetails(userId: bigint, applicationId: bigint) {
        const application = await this.repo.findApplicationById(applicationId);

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        return deepSerialize(application);
    }

    // ✅ Get stage history (from JSON field)
    async getApplicationHistory(userId: bigint, applicationId: bigint) {
        const application = await this.repo.findApplicationById(applicationId);

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        return deepSerialize(application.stageHistory ?? []);
    }

    // ✅ Add or update note (using notes field)
    async addNoteToApplication(userId: bigint, applicationId: bigint, note: string) {
        const application = await this.repo.findApplicationById(applicationId);

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        const updatedApp = await this.repo.updateApplication(applicationId, { notes: note });

        return deepSerialize(updatedApp);
    }

    // ✅ Delete notes (set null in notes field)
    async deleteNotesFromApplication(userId: bigint, applicationId: bigint) {
        const application = await this.repo.findApplicationById(applicationId);

        if (!application) throw new NotFoundException('Application not found');
        if (application.job.employer.userId !== userId)
            throw new ForbiddenException('Unauthorized');

        const updatedApp = await this.repo.updateApplication(applicationId, { notes: null });

        return deepSerialize({ message: 'Notes deleted successfully', application: updatedApp });
    }

    // ✅ Shortlist / Reject / Hire (update status + push to stageHistory JSON)
    async updateApplicationStatus(
        userId: bigint,
        applicationId: bigint,
        status: 'SHORTLISTED' | 'REJECTED' | 'HIRED',
    ) {
        const application = await this.repo.findApplicationById(applicationId);

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

        const updatedApp = await this.repo.updateApplication(applicationId, {
            status,
            stageHistory: updatedHistory as unknown as Prisma.JsonValue,
        });

        return deepSerialize(updatedApp);
    }
}
