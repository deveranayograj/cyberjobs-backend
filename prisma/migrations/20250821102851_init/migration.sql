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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
