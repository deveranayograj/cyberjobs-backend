import { Injectable, NotFoundException } from '@nestjs/common';
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
        website: dto.companyWebsite,
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

    const lastKyc = await this.prisma.employerKYC.findFirst({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
    });
    const attemptNumber = lastKyc ? lastKyc.attemptNumber + 1 : 1;

    const kyc = await this.prisma.employerKYC.create({
      data: {
        employerId: employer.id,
        panCardUrl: dto.panCardUrl,
        incorporationCertUrl: dto.incorporationCertUrl,
        gstCertUrl: dto.gstCertUrl,
        otherDocs: dto.otherDocs ?? [],
        status: 'PENDING',
        attemptNumber,
        previousKycId: lastKyc?.id,
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

  /** Admin action: approve KYC and mark employer verified */
  async approveKyc(kycId: bigint) {
    const kyc = await this.prisma.employerKYC.update({
      where: { id: kycId },
      data: { status: 'APPROVED', remarks: 'Approved by admin' },
    });

    await this.prisma.employer.update({
      where: { id: kyc.employerId },
      data: {
        isVerified: true,
        onboardingStep: 'VERIFIED',
        lastVisitedStep: 'VERIFIED',
      },
    });

    return {
      kyc: this.deepSerialize(kyc),
      nextUrl: '/employer/dashboard',
    };
  }

  /** Admin action: reject KYC */
  async rejectKyc(kycId: bigint, reason: string) {
    const kyc = await this.prisma.employerKYC.update({
      where: { id: kycId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });

    await this.prisma.employer.update({
      where: { id: kyc.employerId },
      data: { onboardingStep: 'KYC_PENDING', lastVisitedStep: 'KYC_PENDING' },
    });

    return {
      kyc: this.deepSerialize(kyc),
      nextUrl: '/employer/kyc',
    };
  }

  /** Get employer status including latest KYC */
  async getEmployerStatus(userId: bigint) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
      include: {
        kycs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!employer) throw new NotFoundException('Employer profile not found');

    const latestKyc = employer.kycs[0] || null;

    return this.deepSerialize({
      employer: {
        companyName: employer.companyName,
        isVerified: employer.isVerified,
      },
      kyc: latestKyc
        ? {
            status: latestKyc.status,
            remarks: latestKyc.remarks,
            rejectionReason: latestKyc.rejectionReason,
            attemptNumber: latestKyc.attemptNumber,
          }
        : null,
    });
  }
}
