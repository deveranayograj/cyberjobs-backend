import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { ChangeJobStatusDto } from './dtos/change-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  private parseBigInt(value?: string, name?: string): bigint {
    if (!value) throw new Error(`${name ?? 'ID'} missing`);
    try {
      return BigInt(value);
    } catch {
      throw new Error(`${name ?? 'ID'} must be a valid bigint`);
    }
  }

  @Post()
  async create(
    @Query('employerId') employerId: string,
    @Body() dto: CreateJobDto,
  ) {
    const id = this.parseBigInt(employerId, 'employerId');
    return await this.jobService.createJob(id, dto);
  }

  @Patch()
  async update(@Query('jobId') jobId: string, @Body() dto: UpdateJobDto) {
    const id = this.parseBigInt(jobId, 'jobId');
    return await this.jobService.updateJob(id, dto);
  }

  @Patch('status')
  async changeStatus(
    @Query('jobId') jobId: string,
    @Body() dto: ChangeJobStatusDto,
  ) {
    const id = this.parseBigInt(jobId, 'jobId');
    return await this.jobService.changeStatus(id, dto);
  }

  @Get('employer')
  async getByEmployer(@Query('employerId') employerId: string) {
    const id = this.parseBigInt(employerId, 'employerId');
    return await this.jobService.getJobsByEmployer(id);
  }

  @Get()
  async getJob(@Query('jobId') jobId: string) {
    const id = this.parseBigInt(jobId, 'jobId');
    return await this.jobService.getJob(id);
  }
}
