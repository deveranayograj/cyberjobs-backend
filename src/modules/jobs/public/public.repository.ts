import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, Job } from '@prisma/client';

@Injectable()
export class PublicRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findJobs(where: Prisma.JobWhereInput, skip: number, take: number) {
        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                include: { employer: true, location: true, JobCategory: true },
                skip,
                take,
                orderBy: { postedAt: 'desc' },
            }),
            this.prisma.job.count({ where }),
        ]);

        return { jobs, total };
    }

    async findJobBySlug(slug: string) {
        return this.prisma.job.findUnique({
            where: { slug },
            include: { employer: true, location: true, JobCategory: true },
        });
    }
}
