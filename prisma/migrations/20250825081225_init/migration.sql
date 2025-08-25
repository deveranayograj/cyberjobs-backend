-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SEEKER', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_2FA');

-- CreateEnum
CREATE TYPE "public"."ProviderType" AS ENUM ('GOOGLE', 'GITHUB');

-- CreateEnum
CREATE TYPE "public"."CompanySize" AS ENUM ('SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500_PLUS');

-- CreateEnum
CREATE TYPE "public"."KYCStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."EmployerOnboardingStep" AS ENUM ('EMAIL_VERIFIED', 'SETUP_STARTED', 'SETUP_COMPLETE', 'KYC_PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "public"."EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE');

-- CreateEnum
CREATE TYPE "public"."ExperienceLevel" AS ENUM ('ENTRY', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "public"."SalaryType" AS ENUM ('ANNUAL', 'MONTHLY', 'HOURLY');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('INR', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "public"."ApplyType" AS ENUM ('DIRECT', 'EXTERNAL', 'PRE_SCREENING');

-- CreateEnum
CREATE TYPE "public"."WorkMode" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "status" "public"."AccountStatus" NOT NULL DEFAULT 'PENDING',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "refreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobSeeker" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "profileImage" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "personalWebsite" TEXT,

    CONSTRAINT "JobSeeker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Employer" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyLogo" TEXT,
    "bannerUrl" TEXT,
    "companyWebsite" TEXT,
    "website" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "companySize" "public"."CompanySize" NOT NULL,
    "foundedYear" INTEGER,
    "location" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "mission" TEXT,
    "vision" TEXT,
    "values" TEXT[],
    "linkedIn" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "glassdoor" TEXT,
    "crunchbase" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactDesignation" TEXT,
    "perksAndBenefits" TEXT[],
    "hiringProcess" TEXT,
    "remoteFriendly" BOOLEAN,
    "teamSizeInTech" INTEGER,
    "cultureHighlights" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "flaggedReason" TEXT,
    "onboardingStep" "public"."EmployerOnboardingStep" DEFAULT 'EMAIL_VERIFIED',
    "lastVisitedStep" "public"."EmployerOnboardingStep",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmployerKYC" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "employerId" BIGINT NOT NULL,
    "panCardUrl" TEXT,
    "incorporationCertUrl" TEXT,
    "gstCertUrl" TEXT,
    "otherDocs" TEXT[],
    "status" "public"."KYCStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" BIGINT,
    "reviewedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "rejectionReason" TEXT,
    "employerAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "previousKycId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerKYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobSeekerSkill" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "jobSeekerId" BIGINT NOT NULL,
    "skillId" BIGINT NOT NULL,

    CONSTRAINT "JobSeekerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobSeekerResume" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "jobSeekerId" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSeekerResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Experience" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "jobSeekerId" BIGINT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "jobSeekerId" BIGINT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certification" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "jobSeekerId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProvider" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "provider" "public"."ProviderType" NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Token" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "public"."TokenType" NOT NULL,
    "userId" BIGINT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employerId" BIGINT NOT NULL,
    "industry" TEXT NOT NULL,
    "workMode" "public"."WorkMode" NOT NULL,
    "employmentType" "public"."EmploymentType" NOT NULL,
    "experience" "public"."ExperienceLevel" NOT NULL,
    "salaryMin" DOUBLE PRECISION NOT NULL,
    "salaryMax" DOUBLE PRECISION NOT NULL,
    "salaryType" "public"."SalaryType" NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "validTill" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "benefits" TEXT[],
    "educationLevel" TEXT NOT NULL,
    "tags" TEXT[],
    "technologies" TEXT[],
    "certifications" TEXT[],
    "clearanceRequired" BOOLEAN,
    "applyType" "public"."ApplyType" NOT NULL,
    "applyUrl" TEXT,
    "applicationEmail" TEXT,
    "applicationLimit" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "shortlistedCount" INTEGER,
    "hiredCount" INTEGER,
    "bookmarkedCount" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "jobCategoryId" BIGINT,
    "locationId" BIGINT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScreeningQuestion" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "jobId" BIGINT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],
    "required" BOOLEAN NOT NULL,

    CONSTRAINT "ScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobCategory" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "main" TEXT NOT NULL,
    "sub" TEXT NOT NULL,

    CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobLocation" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "JobLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "action" TEXT NOT NULL,
    "userId" BIGINT,
    "employerId" BIGINT,
    "jobId" BIGINT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uniqueKey_key" ON "public"."User"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeeker_uniqueKey_key" ON "public"."JobSeeker"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeeker_userId_key" ON "public"."JobSeeker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_uniqueKey_key" ON "public"."Employer"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_userId_key" ON "public"."Employer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_slug_key" ON "public"."Employer"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerKYC_uniqueKey_key" ON "public"."EmployerKYC"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "public"."Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeekerResume_uniqueKey_key" ON "public"."JobSeekerResume"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Experience_uniqueKey_key" ON "public"."Experience"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Education_uniqueKey_key" ON "public"."Education"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_uniqueKey_key" ON "public"."Certification"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserProvider_uniqueKey_key" ON "public"."UserProvider"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Token_uniqueKey_key" ON "public"."Token"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "public"."Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Job_uniqueKey_key" ON "public"."Job"("uniqueKey");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "public"."Job"("slug");

-- AddForeignKey
ALTER TABLE "public"."JobSeeker" ADD CONSTRAINT "JobSeeker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Employer" ADD CONSTRAINT "Employer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployerKYC" ADD CONSTRAINT "EmployerKYC_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "public"."Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmployerKYC" ADD CONSTRAINT "EmployerKYC_previousKycId_fkey" FOREIGN KEY ("previousKycId") REFERENCES "public"."EmployerKYC"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSeekerSkill" ADD CONSTRAINT "JobSeekerSkill_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "public"."JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSeekerSkill" ADD CONSTRAINT "JobSeekerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSeekerResume" ADD CONSTRAINT "JobSeekerResume_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "public"."JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Experience" ADD CONSTRAINT "Experience_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "public"."JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "public"."JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certification" ADD CONSTRAINT "Certification_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "public"."JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProvider" ADD CONSTRAINT "UserProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "public"."Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "public"."JobCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."JobLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreeningQuestion" ADD CONSTRAINT "ScreeningQuestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
