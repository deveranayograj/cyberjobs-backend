-- AlterTable
ALTER TABLE "public"."Certification" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Education" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Employer" ADD COLUMN     "companyWebsite" TEXT,
ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."EmployerKYC" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Experience" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobSeeker" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobSeekerResume" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."JobSeekerSkill" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Skill" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."Token" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);

-- AlterTable
ALTER TABLE "public"."UserProvider" ALTER COLUMN "id" SET DEFAULT floor(random()*1000000000+1000000000);
