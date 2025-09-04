import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FilterJobsDto } from './dtos/filter-jobs.dto';
import { serializeJobList, serializeJobDetail } from '../../../shared/helpers/serialize-job.helper';
import { PublicRepository } from './public.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class PublicService {
    private readonly logger = new Logger(PublicService.name);

    constructor(private readonly repo: PublicRepository) { }

    /** ================= List Jobs ================= */
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

        this.logger.log(`Listing jobs with filter: ${JSON.stringify(filter)}`);

        const where: Prisma.JobWhereInput = {
            status: 'ACTIVE',
            title: search ? { contains: search, mode: 'insensitive' } : undefined,
            employmentType: employmentType || undefined,
            workMode: workMode || undefined,
            JobCategory: category
                ? { is: { main: { contains: category, mode: 'insensitive' } } }
                : undefined,
            location: location
                ? { is: { city: { contains: location, mode: 'insensitive' } } }
                : undefined,
        };

        this.logger.debug(`Prisma where clause: ${JSON.stringify(where)}`);

        const { jobs, total } = await this.repo.findJobs(
            where,
            (page - 1) * limit,
            limit,
        );

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

    /** ================= Get Job Detail ================= */
    async getJobDetail(slug: string) {
        this.logger.log(`Fetching job detail for slug: ${slug}`);

        const job = await this.repo.findJobBySlug(slug);

        if (!job) {
            this.logger.warn(`Job not found for slug: ${slug}`);
            throw new NotFoundException('Job not found');
        }

        this.logger.log(`Returning job detail for: ${job.title}`);

        return serializeJobDetail(job);
    }
}
