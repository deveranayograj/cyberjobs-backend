import { Controller, Get, Query, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { PublicService } from './public.service';
import { FilterJobsDto } from './dtos/filter-jobs.dto';

@Controller('jobs')
export class PublicController {
    constructor(private readonly publicService: PublicService) { }

    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    async listJobs(@Query() filter: FilterJobsDto) {
        return this.publicService.listJobs(filter);
    }

    @Get(':slug')
    async jobDetail(@Param('slug') slug: string) {
        return this.publicService.getJobDetail(slug);
    }
}
