import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateEmployerProfileDto } from './dtos/update-employer-profile.dto';

@Injectable()
export class EmployerProfileService {
    constructor(private readonly prisma: PrismaService) { }

    private deepSerialize(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'bigint') return obj.toString();
        if (Array.isArray(obj)) return obj.map((i) => this.deepSerialize(i));
        if (typeof obj === 'object') {
            const res: Record<string, any> = {};
            for (const key in obj) res[key] = this.deepSerialize(obj[key]);
            return res;
        }
        return obj;
    }

    async getProfile(userId: bigint) {
        const employer = await this.prisma.employer.findUnique({ where: { userId } });
        if (!employer) throw new NotFoundException('Employer profile not found');
        return this.deepSerialize(employer);
    }


    async updateProfile(userId: bigint, dto: UpdateEmployerProfileDto) {
        const employer = await this.prisma.employer.findUnique({ where: { userId } });
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

        // 👇 tell TS this object will be keyed by UpdateEmployerProfileDto keys
        const filteredData: Partial<Record<keyof UpdateEmployerProfileDto, unknown>> = {};

        for (const field of allowedFields) {
            if (dto[field] !== undefined) {
                filteredData[field] = dto[field];
            }
        }

        const updatedEmployer = await this.prisma.employer.update({
            where: { userId },
            data: filteredData as Partial<UpdateEmployerProfileDto>, // final cast
        });

        return this.deepSerialize(updatedEmployer);
    }


}
