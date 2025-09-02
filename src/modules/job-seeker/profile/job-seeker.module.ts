import { Module } from '@nestjs/common';
import { JobSeekerService } from '@modules/job-seeker/profile/job-seeker.service';
import { JobSeekerController } from '@modules/job-seeker/profile/job-seeker.controller';
import { PrismaService } from '@prisma/prisma.service';
import { JobSeekerRepository } from '@modules/job-seeker/profile/job-seeker.repository';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [JobSeekerController],
  providers: [
    JobSeekerService,
    JobSeekerRepository, // ✅ Add this
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [JobSeekerService],
})
export class JobSeekerModule { }
