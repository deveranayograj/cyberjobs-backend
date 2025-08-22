import { Module, forwardRef } from '@nestjs/common';
import { EmployerController } from '@modules/employer/verification/employer.controller';
import { EmployerService } from '@modules/employer/verification/employer.service';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [EmployerController],
  providers: [EmployerService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [EmployerService],
})
export class EmployerModule { }
