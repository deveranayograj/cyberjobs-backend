import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { FilterJobsDto } from './dtos/filter-jobs.dto';
import { serializeJobList, serializeJobDetail } from './helpers/serialize-job.helper';
import { Prisma } from '@prisma/client';

type JobWithRelations = Prisma.JobGetPayload<{
    include: { employer: true; location: true; JobCategory: true };
}>;

@Injectable()
export class PublicService {
    private readonly logger = new Logger(PublicService.name);

    constructor(private readonly prisma: PrismaService) { }

    async listJobs(filter: FilterJobsDto) {
        const {
            page = 1,
            limit = 20,
            search,
            category,
            location,
            employmentType,
            workMode,
        } = filter;

        // Log incoming filter
        this.logger.log(`Listing jobs with filter: ${JSON.stringify(filter)}`);

        // Build Prisma where clause
        const where: Prisma.JobWhereInput = {
            status: 'ACTIVE',
            title: search ? { contains: search, mode: 'insensitive' } : undefined,
            employmentType: employmentType || undefined,
            workMode: workMode || undefined,
            JobCategory: category ? { is: { main: category } } : undefined,
            location: location ? { is: { city: location } } : undefined,
        };

        this.logger.debug(`Prisma where clause: ${JSON.stringify(where)}`);

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                include: { employer: true, location: true, JobCategory: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { postedAt: 'desc' },
            }) as Promise<JobWithRelations[]>,
            this.prisma.job.count({ where }),
        ]);

        this.logger.log(`Found ${jobs.length} jobs out of ${total}`);

        return {
            data: jobs.map(serializeJobList),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
            },
        };
    }

    async getJobDetail(slug: string) {
        this.logger.log(`Fetching job detail for slug: ${slug}`);

        const job = await this.prisma.job.findUnique({
            where: { slug },
            include: { employer: true, location: true, JobCategory: true },
        }) as JobWithRelations | null;

        if (!job) {
            this.logger.warn(`Job not found for slug: ${slug}`);
            throw new NotFoundException('Job not found');
        }

        this.logger.log(`Returning job detail for: ${job.title}`);

        return serializeJobDetail(job);
    }
}
