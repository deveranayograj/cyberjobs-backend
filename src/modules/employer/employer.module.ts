import { Module, forwardRef } from '@nestjs/common';
import { EmployerController } from './employer.controller';
import { EmployerService } from './employer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [EmployerController],
  providers: [EmployerService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [EmployerService],
})
export class EmployerModule {}
