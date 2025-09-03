import { Module } from '@nestjs/common';
import { EmployerProfileController } from './employer-profile.controller';
import { EmployerProfileService } from './employer-profile.service';
import { EmployerProfileRepository } from './employer-profile.repository';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    controllers: [EmployerProfileController],
    providers: [EmployerProfileService, EmployerProfileRepository, PrismaService],
    exports: [EmployerProfileService, EmployerProfileRepository], // ✅ exporting repo
})
export class EmployerProfileModule { }
