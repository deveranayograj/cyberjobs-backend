import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { JobApplicationSource } from '@prisma/client';
import { AppLogger } from '@app/core/logger/logger.service';
import { Prisma } from '@prisma/client'; // <- add this import at top

interface StageHistoryEntry {
    status: string;
    date: string;
}

interface AnswerCreateInput {
    questionId: bigint;
    answer: string | string[];
}

@Injectable()
export class ApplyRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: AppLogger,
    ) { }

    /** JobSeeker lookup by userId */
    async findJobSeeker(userId: bigint) {
        return this.prisma.jobSeeker.findUnique({ where: { userId } });
    }

    /** Job lookup by id including screening questions */
    async findJob(jobId: bigint) {
        return this.prisma.job.findUnique({
            where: { id: jobId },
            include: { screeningQuestions: true },
        });
    }

    /** Check if application already exists */
    async findExistingApplication(jobSeekerId: bigint, jobId: bigint) {
        return this.prisma.jobApplication.findFirst({
            where: {
                jobId,
                jobSeekerId,
                NOT: { status: 'WITHDRAWN' },
            },
        });
    }

    /** Create a new application */
    async createApplication(data: {
        jobId: bigint;
        jobSeekerId: bigint;
        resumeId?: bigint;
        coverLetter?: string;
        source?: JobApplicationSource;
        answers?: AnswerCreateInput[];
    }) {
        const application = await this.prisma.jobApplication.create({
            data: {
                jobId: data.jobId,
                jobSeekerId: data.jobSeekerId,
                resumeId: data.resumeId,
                coverLetter: data.coverLetter,
                source: data.source ?? JobApplicationSource.DIRECT,
                appliedAt: new Date(),
                stageHistory: [{ status: 'APPLIED', date: new Date().toISOString() }],
                answers: data.answers && data.answers.length ? { create: data.answers } : undefined,
            },
            include: {
                job: {
                    select: { title: true, employer: { select: { companyName: true } } },
                },
                answers: true,
            },
        });

        this.logger.log(`Created application ${application.id} for job ${data.jobId}`, 'ApplyRepository');
        return application;
    }

    /** Increment job application count */
    async incrementJobApplications(jobId: bigint) {
        const updated = await this.prisma.job.update({
            where: { id: jobId },
            data: { applicationsCount: { increment: 1 } },
        });
        this.logger.log(`Incremented applications count for job ${jobId}`, 'ApplyRepository');
        return updated;
    }

    /** Decrement job application count */
    async decrementJobApplications(jobId: bigint) {
        const updated = await this.prisma.job.update({
            where: { id: jobId },
            data: { applicationsCount: { decrement: 1 } },
        });
        this.logger.log(`Decremented applications count for job ${jobId}`, 'ApplyRepository');
        return updated;
    }

    /** Fetch applications for a jobSeeker with optional pagination */
    async findApplications(jobSeekerId: bigint, skip = 0, take = 20) {
        return this.prisma.jobApplication.findMany({
            where: { jobSeekerId },
            include: {
                job: { select: { title: true, employer: { select: { companyName: true } } } },
                answers: true,
            },
            orderBy: { appliedAt: 'desc' },
            skip,
            take,
        });
    }

    /** Find a single application by ID */
    async findApplicationById(jobSeekerId: bigint, applicationId: bigint) {
        return this.prisma.jobApplication.findFirst({
            where: { id: applicationId, jobSeekerId },
            include: {
                job: { select: { title: true, employer: { select: { companyName: true } } } },
                answers: true,
            },
        });
    }

    /** Withdraw an application */
    async withdrawApplication(application: { id: bigint; stageHistory?: Prisma.JsonValue }) {
        // Ensure stageHistory is always typed as an array of {status, date}
        const stageHistoryTyped: { status: string; date: string }[] = Array.isArray(application.stageHistory)
            ? (application.stageHistory as { status: string; date: string }[])
            : [];

        const updated = await this.prisma.jobApplication.update({
            where: { id: application.id },
            data: {
                status: 'WITHDRAWN',
                withdrawnAt: new Date(),
                stageHistory: [
                    ...stageHistoryTyped,
                    { status: 'WITHDRAWN', date: new Date().toISOString() },
                ] as Prisma.JsonValue, // Cast as JsonValue for Prisma
            },
        });

        this.logger.log(`Withdrawn application ${application.id}`, 'ApplyRepository');
        return updated;
    }

}
