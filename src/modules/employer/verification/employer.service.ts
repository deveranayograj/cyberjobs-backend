import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateEmployerDto } from '@modules/employer/verification/dtos/create-employer.dto';
import { SubmitKycDto } from '@modules/employer/verification/dtos/submit-kyc.dto';

@Injectable()
export class EmployerService {
  constructor(private readonly prisma: PrismaService) {}

  /** Convert BigInt to string recursively */
  private deepSerialize(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map((i) => this.deepSerialize(i));
    if (typeof obj === 'object') {
      const res: Record<string, unknown> = {};
      // eslint-disable-next-line guard-for-in
      for (const key in obj) res[key] = this.deepSerialize((obj as any)[key]);
      return res;
    }
    return obj;
  }

  /** Setup employer profile and return next step URL */
  async setupEmployer(userId: bigint, dto: CreateEmployerDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const updatedEmployer = await this.prisma.employer.update({
      where: { userId },
      data: {
        companyName: dto.companyName,
        slug,
        companyWebsite: dto.companyWebsite,
        companySize: dto.companySize,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        onboardingStep: 'SETUP_COMPLETE',
        lastVisitedStep: 'SETUP_COMPLETE',
      },
    });

    return {
      employer: this.deepSerialize(updatedEmployer),
      nextUrl: '/employer/kyc',
    };
  }

  /** Submit KYC and return next step URL */
  async submitKyc(userId: bigint, dto: SubmitKycDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    // Enforce one active (PENDING) KYC and prevent resubmission after approval
    const latestKyc = await this.prisma.employerKYC.findFirst({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
    });

    if (latestKyc?.status === 'PENDING') {
      throw new ConflictException('A KYC submission is already pending review');
    }
    if (latestKyc?.status === 'APPROVED') {
      throw new ConflictException('Employer is already verified');
    }

    const attemptNumber = latestKyc ? latestKyc.attemptNumber + 1 : 1;

    const kyc = await this.prisma.employerKYC.create({
      data: {
        employerId: employer.id,
        panCardUrl: dto.panCardUrl,
        incorporationCertUrl: dto.incorporationCertUrl,
        gstCertUrl: dto.gstCertUrl,
        otherDocs: dto.otherDocs ?? [],
        status: 'PENDING',
        attemptNumber,
        previousKycId: latestKyc?.id,
      },
    });

    // Update employer onboarding step
    await this.prisma.employer.update({
      where: { id: employer.id },
      data: { onboardingStep: 'KYC_PENDING', lastVisitedStep: 'KYC_PENDING' },
    });

    return {
      kyc: this.deepSerialize(kyc),
      nextUrl: '/employer/kyc-status',
    };
  }

  /** Admin action: approve KYC and mark employer verified (only latest & pending) */
  async approveKyc(kycId: bigint) {
    // Load target KYC
    const target = await this.prisma.employerKYC.findUnique({
      where: { id: kycId },
    });
    if (!target) throw new NotFoundException('KYC record not found');

    // Ensure it is the latest for this employer
    const latest = await this.prisma.employerKYC.findFirst({
      where: { employerId: target.employerId },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest || latest.id !== target.id) {
      throw new ConflictException('Only the latest KYC can be approved');
    }
    if (latest.status !== 'PENDING') {
      throw new ConflictException('Only PENDING KYCs can be approved');
    }

    // Transaction to avoid race conditions
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedKyc = await tx.employerKYC.update({
        where: { id: kycId },
        data: { status: 'APPROVED', remarks: 'Approved by admin' },
      });

      const updatedEmployer = await tx.employer.update({
        where: { id: target.employerId },
        data: {
          isVerified: true,
          onboardingStep: 'VERIFIED',
          lastVisitedStep: 'VERIFIED',
        },
      });

      return { updatedKyc, updatedEmployer };
    });

    return {
      kyc: this.deepSerialize(result.updatedKyc),
      nextUrl: '/employer/dashboard',
    };
  }

  /** Admin action: reject KYC (only latest & pending) */
  async rejectKyc(kycId: bigint, reason: string) {
    // Load target KYC
    const target = await this.prisma.employerKYC.findUnique({
      where: { id: kycId },
    });
    if (!target) throw new NotFoundException('KYC record not found');

    // Ensure it is the latest for this employer
    const latest = await this.prisma.employerKYC.findFirst({
      where: { employerId: target.employerId },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest || latest.id !== target.id) {
      throw new ConflictException('Only the latest KYC can be rejected');
    }
    if (latest.status !== 'PENDING') {
      throw new ConflictException('Only PENDING KYCs can be rejected');
    }

    // Transaction to keep data consistent
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedKyc = await tx.employerKYC.update({
        where: { id: kycId },
        data: { status: 'REJECTED', rejectionReason: reason },
      });

      const updatedEmployer = await tx.employer.update({
        where: { id: target.employerId },
        data: {
          isVerified: false,
          onboardingStep: 'KYC_PENDING',
          lastVisitedStep: 'KYC_PENDING',
        },
      });

      return { updatedKyc, updatedEmployer };
    });

    return {
      kyc: this.deepSerialize(result.updatedKyc),
      nextUrl: '/employer/kyc',
    };
  }

  /** Get employer status including latest KYC (+ nextUrl hint) */
  async getEmployerStatus(userId: bigint) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
      include: {
        kycs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const latestKyc = employer.kycs[0] || null;

    let nextUrl = '/dashboard';
    if (!employer.companyName) {
      nextUrl = '/employer/setup';
    } else if (employer.onboardingStep === 'SETUP_COMPLETE' && !latestKyc) {
      nextUrl = '/employer/kyc';
    } else if (latestKyc?.status === 'PENDING') {
      nextUrl = '/employer/kyc-status';
    } else if (latestKyc?.status === 'REJECTED') {
      nextUrl = '/employer/kyc';
    } else if (employer.isVerified) {
      nextUrl = '/employer/dashboard';
    }

    return this.deepSerialize({
      employer: {
        companyName: employer.companyName,
        isVerified: employer.isVerified,
        onboardingStep: employer.onboardingStep,
        lastVisitedStep: employer.lastVisitedStep,
      },
      kyc: latestKyc
        ? {
            status: latestKyc.status,
            remarks: latestKyc.remarks,
            rejectionReason: latestKyc.rejectionReason,
            attemptNumber: latestKyc.attemptNumber,
          }
        : null,
      nextUrl,
    });
  }
}
