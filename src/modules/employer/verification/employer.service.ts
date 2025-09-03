// src/modules/employer/verification/employer.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmployerVerificationRepository } from './employer-verification.repository';
import { CreateEmployerDto } from './dtos/create-employer.dto';
import { SubmitKycDto } from './dtos/submit-kyc.dto';
import { deepSerialize } from '@app/shared/utils/serialize.util'; // 👈 import shared util

@Injectable()
export class EmployerService {
  constructor(private readonly repo: EmployerVerificationRepository) { }

  /** Setup employer profile and return next step URL */
  async setupEmployer(userId: bigint, dto: CreateEmployerDto) {
    const employer = await this.repo.findEmployerByUserId(userId);
    if (!employer) throw new NotFoundException('Employer profile not found');

    const slug = dto.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const updatedEmployer = await this.repo.updateEmployer(userId, {
      companyName: dto.companyName,
      slug,
      companyWebsite: dto.companyWebsite,
      companySize: dto.companySize,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      onboardingStep: 'SETUP_COMPLETE',
      lastVisitedStep: 'SETUP_COMPLETE',
    });

    return {
      employer: deepSerialize(updatedEmployer),
      nextUrl: '/employer/kyc',
    };
  }

  /** Submit KYC and return next step URL */
  async submitKyc(userId: bigint, dto: SubmitKycDto) {
    const employer = await this.repo.findEmployerByUserId(userId);
    if (!employer) throw new NotFoundException('Employer profile not found');

    const latestKyc = await this.repo.findLatestKyc(employer.id);

    if (latestKyc?.status === 'PENDING') {
      throw new ConflictException('A KYC submission is already pending review');
    }
    if (latestKyc?.status === 'APPROVED') {
      throw new ConflictException('Employer is already verified');
    }

    const attemptNumber = latestKyc ? latestKyc.attemptNumber + 1 : 1;

    const kyc = await this.repo.createKyc(
      employer.id,
      dto,
      attemptNumber,
      latestKyc?.id,
    );

    await this.repo.updateEmployerById(employer.id, {
      onboardingStep: 'KYC_PENDING',
      lastVisitedStep: 'KYC_PENDING',
    });

    return {
      kyc: deepSerialize(kyc),
      nextUrl: '/employer/kyc-status',
    };
  }

  /** Admin action: approve KYC */
  async approveKyc(kycId: bigint) {
    const target = await this.repo.findKycById(kycId);
    if (!target) throw new NotFoundException('KYC record not found');

    const latest = await this.repo.findLatestKyc(target.employerId);
    if (!latest || latest.id !== target.id) {
      throw new ConflictException('Only the latest KYC can be approved');
    }
    if (latest.status !== 'PENDING') {
      throw new ConflictException('Only PENDING KYCs can be approved');
    }

    const result = await this.repo.approveKycTransaction(kycId, target.employerId);

    return {
      kyc: deepSerialize(result.updatedKyc),
      nextUrl: '/employer/dashboard',
    };
  }

  /** Admin action: reject KYC */
  async rejectKyc(kycId: bigint, reason: string) {
    const target = await this.repo.findKycById(kycId);
    if (!target) throw new NotFoundException('KYC record not found');

    const latest = await this.repo.findLatestKyc(target.employerId);
    if (!latest || latest.id !== target.id) {
      throw new ConflictException('Only the latest KYC can be rejected');
    }
    if (latest.status !== 'PENDING') {
      throw new ConflictException('Only PENDING KYCs can be rejected');
    }

    const result = await this.repo.rejectKycTransaction(kycId, target.employerId, reason);

    return {
      kyc: deepSerialize(result.updatedKyc),
      nextUrl: '/employer/kyc',
    };
  }
  /** Get employer status including latest KYC (+ nextUrl hint) */
  async getEmployerStatus(userId: bigint) {
    const employer = await this.repo.findEmployerWithLatestKyc(userId);
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

    return deepSerialize({
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

  /** Get redirect URL for onboarding flow */
  async getOnboardingRedirect(userId: bigint) {
    const employer = await this.repo.findEmployerByUserId(userId);
    if (!employer) return { redirectUrl: '/dashboard' };

    let redirectUrl = '/dashboard';
    switch (employer.onboardingStep) {
      case 'EMAIL_VERIFIED':
      case 'SETUP_STARTED':
        redirectUrl = '/employer/setup';
        break;
      case 'SETUP_COMPLETE':
        redirectUrl = '/employer/kyc';
        break;
      case 'KYC_PENDING':
        redirectUrl = '/employer/kyc-status';
        break;
      case 'VERIFIED':
        redirectUrl = '/employer/dashboard';
        break;
    }

    return { redirectUrl };
  }
}
