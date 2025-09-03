import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PublicRepository } from './public.repository';
import { FilterJobsDto } from './dtos/filter-jobs.dto';
import { serializeJobList, serializeJobDetail } from '../../../shared/helpers/serialize-job.helper';
import { Prisma, EmploymentType, WorkMode } from '@prisma/client';

@Injectable()
export class PublicService {
    private readonly logger = new Logger(PublicService.name);

    constructor(private readonly repo: PublicRepository) { }

    async listJobs(filter: FilterJobsDto) {
        const { page = 1, limit = 20, search, category, location, employmentType, workMode } = filter;

        const where: Prisma.JobWhereInput = {
            status: 'ACTIVE',
            title: search ? { contains: search, mode: 'insensitive' } : undefined,
            employmentType: employmentType || undefined,
            workMode: workMode || undefined,
            JobCategory: category ? { is: { main: category } } : undefined,
            location: location ? { is: { city: location } } : undefined,
        };

        this.logger.debug(`Filtering jobs with where: ${JSON.stringify(where)}`);

        const { jobs, total } = await this.repo.findJobs(where, (page - 1) * limit, limit);

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
        const job = await this.repo.findJobBySlug(slug);

        if (!job) {
            this.logger.warn(`Job not found for slug: ${slug}`);
            throw new NotFoundException('Job not found');
        }

        return serializeJobDetail(job);
    }
}
