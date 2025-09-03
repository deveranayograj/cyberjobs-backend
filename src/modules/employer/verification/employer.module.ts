// src/modules/employer/verification/employer.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';
import { EmployerVerificationRepository } from './employer-verification.repository';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [EmployerController],
  providers: [
    EmployerService,
    EmployerVerificationRepository, // ✅ new repository added
    PrismaService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [EmployerService, EmployerVerificationRepository], // ✅ export repo so other modules can reuse
})
export class EmployerModule { }
