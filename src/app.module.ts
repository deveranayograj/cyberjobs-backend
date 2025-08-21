import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './common/logger/logger.module';
import { JobSeekerModule } from './modules/job-seeker/job-seeker.module';
import { RedisModule } from './common/redis/redis.module'; // ✅ Import RedisModule

@Module({
  imports: [
    LoggerModule, // ✅ Register logger globally
    PrismaModule,
    UsersModule,
    AuthModule,
    JobSeekerModule, // ✅ JobSeeker routes
    RedisModule, // ✅ Add RedisModule here
  ],
})
export class AppModule {}
