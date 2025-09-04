// src/modules/jobs/employer/job.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, Job, ScreeningQuestion, JobStatus } from '@prisma/client';

@Injectable()
export class JobRepository {
    constructor(private readonly prisma: PrismaService) { }

    /** ================= Create Job ================= */
    async createJob(
        data: Prisma.JobCreateInput,
        questions?: Prisma.ScreeningQuestionCreateManyJobInput[],
    ): Promise<Job> {
        return this.prisma.job.create({
            data: {
                ...data,
                screeningQuestions: questions
                    ? { createMany: { data: questions } }
                    : undefined,
            },
            include: { screeningQuestions: true },
        });
    }

    /** ================= Find Employer by UserId ================= */
    async findEmployerByUserId(userId: bigint) {
        return this.prisma.employer.findUnique({
            where: { userId },
            include: { kycs: true },
        });
    }

    /** ================= Find Job by ID & Employer ================= */
    async findJobById(jobId: bigint, employerId: bigint): Promise<Job | null> {
        return this.prisma.job.findFirst({
            where: { id: jobId, employerId },
            include: { screeningQuestions: true },
        });
    }

    /** ================= Update Job ================= */
    async updateJob(
        jobId: bigint,
        employerId: bigint,
        data: Prisma.JobUpdateInput,
    ): Promise<Job> {
        return this.prisma.job.update({
            where: { id: jobId },
            data,
            include: { screeningQuestions: true },
        });
    }

    /** ================= Delete Job ================= */
    async deleteJob(jobId: bigint, employerId: bigint): Promise<Job> {
        return this.prisma.job.delete({
            where: { id: jobId },
        });
    }

    /** ================= Change Job Status ================= */
    async changeJobStatus(
        jobId: bigint,
        employerId: bigint,
        status: JobStatus,
    ): Promise<Job> {
        return this.prisma.job.update({
            where: { id: jobId },
            data: { status },
        });
    }

    /** ================= List Jobs for Employer ================= */
    async listEmployerJobs(employerId: string | number | bigint): Promise<Job[]> {
        const normalizedEmployerId = BigInt(employerId);

        return this.prisma.job.findMany({
            where: { employerId: normalizedEmployerId },
            include: { screeningQuestions: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** ================= Screening Questions ================= */
    async addScreeningQuestions(
        jobId: bigint,
        questions: Prisma.ScreeningQuestionCreateManyJobInput[],
    ): Promise<Prisma.BatchPayload> {
        return this.prisma.screeningQuestion.createMany({
            data: questions.map((q) => ({ ...q, jobId })),
        });
    }

    async updateScreeningQuestion(
        id: bigint,
        jobId: bigint,
        data: Prisma.ScreeningQuestionUpdateInput,
    ): Promise<ScreeningQuestion> {
        return this.prisma.screeningQuestion.update({
            where: { id },
            data,
        });
    }

    async deleteScreeningQuestion(
        id: bigint,
        jobId: bigint,
    ): Promise<ScreeningQuestion> {
        return this.prisma.screeningQuestion.delete({
            where: { id },
        });
    }
}
