import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { LoggerModule } from '@common/logger/logger.module';
import { JobSeekerModule } from '@modules/job-seeker/profile/job-seeker.module';
import { EmployerModule } from '@modules/employer/verification/employer.module';
import { RedisModule } from '@common/redis/redis.module';
import { JobModule } from '@modules/jobs/job.module';
import { ApplyModule } from '@modules/job-seeker/apply/apply.module';
import { EmployerProfileModule } from '@modules/employer/profile/employer-profile.module';
import { EmployerApplicantsModule } from '@modules/employer/applicants/employer-applicants.module';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    JobSeekerModule,
    EmployerModule,
    RedisModule,
    JobModule,
    ApplyModule,
    EmployerProfileModule,
    EmployerApplicantsModule,
  ],
})
export class AppModule { }
