import { Prisma } from '@prisma/client';
import { deepSerialize } from '../utils/serialize.util';
import { JobResponseDto } from '../../modules/jobs/public/dtos/job-response.dto';
import { JobDetailDto } from '../../modules/jobs/public/dtos/job-detail.dto';

type JobWithRelations = Prisma.JobGetPayload<{
    include: { employer: true; location: true; JobCategory: true };
}>;

/** Serialize job for list endpoints */
export const serializeJobList = (job: JobWithRelations): JobResponseDto => {
    const serialized = deepSerialize(job);

    return {
        id: serialized.id.toString(),
        title: serialized.title,
        slug: serialized.slug,
        companyName: serialized.employer.companyName,
        location: serialized.location?.city || serialized.employer.location || 'N/A',
        workMode: serialized.workMode,
        employmentType: serialized.employmentType,
        salaryMin: serialized.salaryMin,
        salaryMax: serialized.salaryMax,
        currency: serialized.currency,
        postedAt: serialized.postedAt,
        isFeatured: serialized.isFeatured,
        isUrgent: serialized.isUrgent,
        category: serialized.JobCategory ? `${serialized.JobCategory.main} - ${serialized.JobCategory.sub}` : undefined,
    };
};

/** Serialize job for detail endpoints */
export const serializeJobDetail = (job: JobWithRelations): JobDetailDto => {
    const serialized = deepSerialize(job);

    return {
        id: serialized.id.toString(),
        title: serialized.title,
        slug: serialized.slug,
        companyName: serialized.employer.companyName,
        companyLogo: serialized.employer.companyLogo,
        location: serialized.location?.city || serialized.employer.location || 'N/A',
        workMode: serialized.workMode,
        employmentType: serialized.employmentType,
        experience: serialized.experience,
        salaryMin: serialized.salaryMin,
        salaryMax: serialized.salaryMax,
        currency: serialized.currency,
        description: serialized.description,
        requirements: serialized.requirements,
        responsibilities: serialized.responsibilities,
        benefits: serialized.benefits,
        postedAt: serialized.postedAt,
        validTill: serialized.validTill,
        applyType: serialized.applyType,
        applyUrl: serialized.applyUrl,
        applicationEmail: serialized.applicationEmail,
        tags: serialized.tags,
        technologies: serialized.technologies,
        certifications: serialized.certifications,
        category: serialized.JobCategory ? `${serialized.JobCategory.main} - ${serialized.JobCategory.sub}` : undefined,
    };
};
