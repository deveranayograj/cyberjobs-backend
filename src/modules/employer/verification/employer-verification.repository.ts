// src/modules/employer/verification/employer-verification.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateEmployerDto } from './dtos/create-employer.dto';
import { SubmitKycDto } from './dtos/submit-kyc.dto';

@Injectable()
export class EmployerVerificationRepository {
    constructor(private readonly prisma: PrismaService) { }

    /** ---------------- Employer ---------------- */
    findEmployerByUserId(userId: bigint) {
        return this.prisma.employer.findUnique({ where: { userId } });
    }

    updateEmployer(userId: bigint, data: Partial<CreateEmployerDto> & Record<string, any>) {
        return this.prisma.employer.update({ where: { userId }, data });
    }

    updateEmployerById(employerId: bigint, data: Record<string, any>) {
        return this.prisma.employer.update({ where: { id: employerId }, data });
    }

    /** ---------------- KYC ---------------- */
    findLatestKyc(employerId: bigint) {
        return this.prisma.employerKYC.findFirst({
            where: { employerId },
            orderBy: { createdAt: 'desc' },
        });
    }

    createKyc(employerId: bigint, dto: SubmitKycDto, attemptNumber: number, previousKycId?: bigint) {
        return this.prisma.employerKYC.create({
            data: {
                employerId,
                panCardUrl: dto.panCardUrl,
                incorporationCertUrl: dto.incorporationCertUrl,
                gstCertUrl: dto.gstCertUrl,
                otherDocs: dto.otherDocs ?? [],
                status: 'PENDING',
                attemptNumber,
                previousKycId,
            },
        });
    }

    findKycById(kycId: bigint) {
        return this.prisma.employerKYC.findUnique({ where: { id: kycId } });
    }

    updateKyc(kycId: bigint, data: Record<string, any>) {
        return this.prisma.employerKYC.update({ where: { id: kycId }, data });
    }

    /** ---------------- Combined ---------------- */
    findEmployerWithLatestKyc(userId: bigint) {
        return this.prisma.employer.findUnique({
            where: { userId },
            include: { kycs: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
    }

    /** ---------------- Transactions ---------------- */
    async approveKycTransaction(kycId: bigint, employerId: bigint) {
        return this.prisma.$transaction(async (tx) => {
            const updatedKyc = await tx.employerKYC.update({
                where: { id: kycId },
                data: { status: 'APPROVED', remarks: 'Approved by admin' },
            });

            const updatedEmployer = await tx.employer.update({
                where: { id: employerId },
                data: {
                    isVerified: true,
                    onboardingStep: 'VERIFIED',
                    lastVisitedStep: 'VERIFIED',
                },
            });

            return { updatedKyc, updatedEmployer };
        });
    }

    async rejectKycTransaction(kycId: bigint, employerId: bigint, reason: string) {
        return this.prisma.$transaction(async (tx) => {
            const updatedKyc = await tx.employerKYC.update({
                where: { id: kycId },
                data: { status: 'REJECTED', rejectionReason: reason },
            });

            const updatedEmployer = await tx.employer.update({
                where: { id: employerId },
                data: {
                    isVerified: false,
                    onboardingStep: 'KYC_PENDING',
                    lastVisitedStep: 'KYC_PENDING',
                },
            });

            return { updatedKyc, updatedEmployer };
        });
    }
}
