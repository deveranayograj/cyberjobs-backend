import { Prisma } from '@prisma/client';
import { JobResponseDto } from '../../modules/jobs/public/dtos/job-response.dto';
import { JobDetailDto } from '../../modules/jobs/public/dtos/job-detail.dto';

type JobWithRelations = Prisma.JobGetPayload<{
    include: { employer: true; location: true; JobCategory: true };
}>;

export const serializeJobList = (job: JobWithRelations): JobResponseDto => ({
    id: job.id.toString(),
    title: job.title,
    slug: job.slug,
    companyName: job.employer.companyName,
    location: job.location?.city || job.employer.location || 'N/A',
    workMode: job.workMode,
    employmentType: job.employmentType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    postedAt: job.postedAt,
    isFeatured: job.isFeatured,
    isUrgent: job.isUrgent,
});

export const serializeJobDetail = (job: JobWithRelations): JobDetailDto => ({
    id: job.id.toString(),
    title: job.title,
    slug: job.slug,
    companyName: job.employer.companyName,
    companyLogo: job.employer.companyLogo,
    location: job.location?.city || job.employer.location || 'N/A',
    workMode: job.workMode,
    employmentType: job.employmentType,
    experience: job.experience,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    benefits: job.benefits,
    postedAt: job.postedAt,
    validTill: job.validTill,
    applyType: job.applyType,
    applyUrl: job.applyUrl,
    applicationEmail: job.applicationEmail,
    tags: job.tags,
    technologies: job.technologies,
    certifications: job.certifications,
    category: job.JobCategory ? `${job.JobCategory.main} - ${job.JobCategory.sub}` : undefined,
});
