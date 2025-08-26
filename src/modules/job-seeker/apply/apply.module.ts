import { Module } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { ApplyController } from './apply.controller';
import { PrismaService } from '@prisma/prisma.service';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [ApplyController],
  providers: [ApplyService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [ApplyService],
})
export class ApplyModule { }
