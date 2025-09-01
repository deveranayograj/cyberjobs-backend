// src/modules/employer/applicants/dtos/applicant-response.dto.ts
import { ApplicationStatus } from '@prisma/client';

export class ApplicantResponseDto {
    id: string; // uniqueKey of application
    fullName: string;
    email: string;
    skills: string[];
    resumes: { url: string; fileName: string }[]; // ✅ corrected
    score?: number;
    appliedAt: Date;
    status: ApplicationStatus;

    constructor(partial: Partial<ApplicantResponseDto>) {
        Object.assign(this, partial);
    }
}
