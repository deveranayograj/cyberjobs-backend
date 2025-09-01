export class JobDetailDto {
    id: string;
    title: string;
    slug: string;
    companyName: string;
    companyLogo?: string;
    location: string;
    workMode: string;
    employmentType: string;
    experience: string;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    postedAt: Date;
    validTill: Date;
    applyType: string;
    applyUrl?: string;
    applicationEmail?: string;
    tags: string[];
    technologies: string[];
    certifications: string[];
    category?: string; // ✅ Add this line
}
