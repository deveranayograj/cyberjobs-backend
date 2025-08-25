import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { LoggerModule } from '@common/logger/logger.module';
import { JobSeekerModule } from '@modules/job-seeker/job-seeker.module';
import { EmployerModule } from '@modules/employer/verification/employer.module';
import { RedisModule } from '@common/redis/redis.module';
import { JobModule } from '@modules/jobs/job.module'; // ✅ Import JobModule

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    JobSeekerModule,
    EmployerModule,
    RedisModule,
    JobModule, // ✅ Register JobModule here
  ],
})
export class AppModule {}
