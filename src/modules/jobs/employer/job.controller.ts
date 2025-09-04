// src/modules/jobs/employer/job.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JobService } from '@modules/jobs/employer/job.service';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

import { CreateJobDto } from '@modules/jobs/employer/dtos/create-job.dto';
import { UpdateJobDto } from '@modules/jobs/employer/dtos/update-job.dto';
import { ChangeJobStatusDto } from '@modules/jobs/employer/dtos/change-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
@Controller('employer/jobs')
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

  /** ================= Create Job ================= */
  @Post()
  async create(@Body() dto: CreateJobDto, @Req() req: Request) {
    const userId = BigInt(req.user['sub']); // ✅ from JWT
    return await this.jobService.createJob(userId, dto);
  }

  /** ================= Update Job ================= */
  @Patch()
  async update(
    @Query('jobId') jobId: string,
    @Body() dto: UpdateJobDto,
    @Req() req: Request,
  ) {
    const jId = this.parseBigInt(jobId, 'jobId');
    const userId = BigInt(req.user['sub']); // ✅ from JWT
    return await this.jobService.updateJob(jId, userId, dto);
  }

  /** ================= Change Job Status ================= */
  @Patch('status')
  async changeStatus(
    @Query('jobId') jobId: string,
    @Body() dto: ChangeJobStatusDto,
    @Req() req: Request,
  ) {
    const jId = this.parseBigInt(jobId, 'jobId');
    const userId = BigInt(req.user['sub']); // ✅ from JWT
    return await this.jobService.changeStatus(jId, userId, dto);
  }

  /** ================= Get Jobs by Employer ================= */
  @Get('employer')
  async getByEmployer(@Req() req: Request) {
    const userId = BigInt(req.user['sub']); // ✅ from JWT
    return await this.jobService.getJobsByEmployer(userId);
  }

  /** ================= Get Job by ID ================= */
  @Get()
  async getJob(@Query('jobId') jobId: string, @Req() req: Request) {
    const jId = this.parseBigInt(jobId, 'jobId');
    const userId = BigInt(req.user['sub']); // ✅ from JWT
    return await this.jobService.getJob(jId, userId);
  }
}
