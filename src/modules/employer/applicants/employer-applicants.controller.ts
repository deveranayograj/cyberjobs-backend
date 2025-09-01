// src/modules/employer/applicants/employer-applicants.controller.ts
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { EmployerApplicantsService } from './employer-applicants.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

interface RequestWithUser extends Request {
    user: { sub: string; role: UserRole };
}

@Controller('employer/applicants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
export class EmployerApplicantsController {
    constructor(private readonly applicantsService: EmployerApplicantsService) { }

    @Get(':jobId')
    async getApplicants(@Req() req: RequestWithUser, @Param('jobId') jobId: string) {
        const applicants = await this.applicantsService.getApplicantsForJob(
            BigInt(req.user.sub),
            BigInt(jobId),
        );
        return { applicants };
    }
}
