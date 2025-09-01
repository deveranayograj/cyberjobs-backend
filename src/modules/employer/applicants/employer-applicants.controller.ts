import {
    Controller,
    Get,
    Param,
    Req,
    UseGuards,
    Query,
    Post,
    Body,
    Delete,
    Patch,
} from '@nestjs/common';
import { EmployerApplicantsService } from './employer-applicants.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole, ApplicationStatus } from '@prisma/client';
import type { Request } from 'express';
import { IsEnum } from 'class-validator';

interface RequestWithUser extends Request {
    user: { sub: string; role: UserRole };
}

// DTO for updating status
class UpdateStatusDto {
    @IsEnum(ApplicationStatus)
    status: ApplicationStatus;
}

@Controller('employer/applicants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
export class EmployerApplicantsController {
    constructor(private readonly applicantsService: EmployerApplicantsService) { }

    // ✅ Get all applicants for a job (with optional filters)
    @Get(':jobId')
    async getApplicants(
        @Req() req: RequestWithUser,
        @Param('jobId') jobId: string,
        @Query('status') status?: string,
        @Query('skill') skill?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
    ) {
        const applicants = await this.applicantsService.getApplicantsForJob(
            BigInt(req.user.sub),
            BigInt(jobId),
            { status, skill, dateFrom, dateTo },
        );
        return { applicants };
    }

    // ✅ Get single application details
    @Get('application/:applicationId')
    async getApplicationDetails(
        @Req() req: RequestWithUser,
        @Param('applicationId') applicationId: string,
    ) {
        return this.applicantsService.getApplicationDetails(
            BigInt(req.user.sub),
            BigInt(applicationId),
        );
    }

    // ✅ Get stage history
    @Get('application/:applicationId/history')
    async getApplicationHistory(
        @Req() req: RequestWithUser,
        @Param('applicationId') applicationId: string,
    ) {
        return this.applicantsService.getApplicationHistory(
            BigInt(req.user.sub),
            BigInt(applicationId),
        );
    }

    // ✅ Add note
    @Post('application/:applicationId/notes')
    async addNote(
        @Req() req: RequestWithUser,
        @Param('applicationId') applicationId: string,
        @Body('note') note: string,
    ) {
        return this.applicantsService.addNoteToApplication(
            BigInt(req.user.sub),
            BigInt(applicationId),
            note,
        );
    }

    // ✅ Delete notes
    @Delete('application/:applicationId/notes')
    async deleteNotes(
        @Req() req: RequestWithUser,
        @Param('applicationId') applicationId: string,
    ) {
        return this.applicantsService.deleteNotesFromApplication(
            BigInt(req.user.sub),
            BigInt(applicationId),
        );
    }

    // ✅ Update application status (SHORTLISTED / REJECTED / HIRED)
    @Patch('application/:applicationId/status')
    async updateStatus(
        @Req() req: RequestWithUser,
        @Param('applicationId') applicationId: string,
        @Body() body: UpdateStatusDto,
    ) {
        return this.applicantsService.updateApplicationStatus(
            BigInt(req.user.sub),
            BigInt(applicationId),
            body.status as 'SHORTLISTED' | 'REJECTED' | 'HIRED',
        );
    }
}
