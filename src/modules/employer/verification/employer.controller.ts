// src/modules/employer/verification/employer.controller.ts

import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { EmployerService } from '@modules/employer/verification/employer.service';
import { CreateEmployerDto } from '@modules/employer/verification/dtos/create-employer.dto';
import { SubmitKycDto } from '@modules/employer/verification/dtos/submit-kyc.dto';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { sub: string; role: UserRole };
}

@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) { }

  /** --------------------- EMPLOYER ROUTES --------------------- */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post('setup')
  async setup(@Req() req: RequestWithUser, @Body() dto: CreateEmployerDto) {
    const result = await this.employerService.setupEmployer(
      BigInt(req.user.sub),
      dto,
    );
    return {
      message: 'Employer setup completed',
      employer: result.employer,
      nextUrl: result.nextUrl,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post('kyc')
  async submitKyc(@Req() req: RequestWithUser, @Body() dto: SubmitKycDto) {
    const result = await this.employerService.submitKyc(
      BigInt(req.user.sub),
      dto,
    );
    return {
      message: 'KYC submitted successfully',
      kyc: result.kyc,
      nextUrl: result.nextUrl,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('status')
  async getStatus(@Req() req: RequestWithUser) {
    return this.employerService.getEmployerStatus(BigInt(req.user.sub));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Get('onboarding-redirect')
  async getOnboardingRedirect(@Req() req: RequestWithUser) {
    return this.employerService.getOnboardingRedirect(BigInt(req.user.sub));
  }

  /** --------------------- ADMIN ROUTES --------------------- */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post('admin/kyc/approve')
  async approveKyc(@Body('kycId') kycId: string) {
    const result = await this.employerService.approveKyc(BigInt(kycId));
    return {
      message: 'KYC approved successfully',
      kyc: result.kyc,
      nextUrl: result.nextUrl,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYER)
  @Post('admin/kyc/reject')
  async rejectKyc(@Body() body: { kycId: string; reason: string }) {
    const result = await this.employerService.rejectKyc(
      BigInt(body.kycId),
      body.reason,
    );
    return {
      message: 'KYC rejected',
      kyc: result.kyc,
      nextUrl: result.nextUrl,
    };
  }
}
