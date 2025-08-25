import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [JobController],
  providers: [JobService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JobService],
})
export class JobModule {}
