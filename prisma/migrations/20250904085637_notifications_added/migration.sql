-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('JOB_ALERT', 'APPLICATION_SUBMITTED', 'APPLICATION_STATUS', 'INTERVIEW_SCHEDULED', 'INTERVIEW_UPDATED', 'PROFILE_REMINDER', 'PLATFORM_ANNOUNCEMENT', 'NEW_APPLICANT', 'APPLICATION_UPDATE', 'JOB_EXPIRY_ALERT', 'JOB_APPROVAL', 'GROUPED_APPLICANTS', 'FEEDBACK_RECEIVED', 'BOOKMARK_ALERT', 'CERTIFICATION_ALERT', 'BUG_BOUNTY_ALERT');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ');

-- AlterTable
ALTER TABLE "public"."AuditLog" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Certification" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Education" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Employer" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."EmployerKYC" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Experience" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Job" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobApplication" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobApplicationAnswer" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobCategory" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobLocation" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobSeeker" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobSeekerResume" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobSeekerSkill" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."ScreeningQuestion" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Skill" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Token" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."UserProvider" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" BIGINT NOT NULL DEFAULT floor(random()*1000000000+1000000000),
    "uniqueKey" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "relatedId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_uniqueKey_key" ON "public"."Notification"("uniqueKey");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "public"."Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
