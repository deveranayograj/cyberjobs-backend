export class JobResponseDto {
    id: string;
    title: string;
    slug: string;
    companyName: string;
    location: string;
    workMode: string;
    employmentType: string;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    postedAt: Date;
    isFeatured: boolean;
    isUrgent: boolean;
    category?: string; // ✅ Add this line
}
