import { Module } from '@nestjs/common';
import { JobSeekerService } from '@modules/job-seeker/profile/job-seeker.service';
import { JobSeekerController } from '@modules/job-seeker/profile/job-seeker.controller';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [JobSeekerController],
  providers: [JobSeekerService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JobSeekerService],
})
export class JobSeekerModule {}
