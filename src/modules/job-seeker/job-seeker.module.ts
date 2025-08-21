import { Module } from '@nestjs/common';
import { JobSeekerService } from './job-seeker.service';
import { JobSeekerController } from './job-seeker.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [JobSeekerController],
  providers: [JobSeekerService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JobSeekerService],
})
export class JobSeekerModule {}
