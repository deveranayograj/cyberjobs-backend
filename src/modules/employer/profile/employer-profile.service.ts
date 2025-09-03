import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployerProfileRepository } from './employer-profile.repository';
import { UpdateEmployerProfileDto } from './dtos/update-employer-profile.dto';
import { deepSerialize } from '@app/shared/utils/serialize.util';

@Injectable()
export class EmployerProfileService {
    constructor(private readonly repo: EmployerProfileRepository) { }

    async getProfile(userId: bigint) {
        const employer = await this.repo.findByUserId(userId);
        if (!employer) throw new NotFoundException('Employer profile not found');

        return deepSerialize(employer);
    }

    async updateProfile(userId: bigint, dto: UpdateEmployerProfileDto) {
        const employer = await this.repo.findByUserId(userId);
        if (!employer) throw new NotFoundException('Employer profile not found');

        const allowedFields: (keyof UpdateEmployerProfileDto)[] = [
            'industry',
            'foundedYear',
            'location',
            'about',
            'mission',
            'vision',
            'values',
            'linkedIn',
            'twitter',
            'facebook',
            'instagram',
            'youtube',
            'glassdoor',
            'crunchbase',
            'contactPhone',
            'contactDesignation',
            'perksAndBenefits',
            'hiringProcess',
            'remoteFriendly',
            'teamSizeInTech',
            'cultureHighlights',
            'companyLogo',
            'bannerUrl',
        ];

        const filteredData: Partial<Record<keyof UpdateEmployerProfileDto, unknown>> = {};
        for (const field of allowedFields) {
            if (dto[field] !== undefined) {
                filteredData[field] = dto[field];
            }
        }

        const updatedEmployer = await this.repo.updateByUserId(
            userId,
            filteredData as any,
        );

        return deepSerialize(updatedEmployer);
    }
}
