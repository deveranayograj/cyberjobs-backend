import { Module } from '@nestjs/common';
import { EmployerProfileController } from './employer-profile.controller';
import { EmployerProfileService } from './employer-profile.service';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    controllers: [EmployerProfileController],
    providers: [EmployerProfileService, PrismaService],
    exports: [EmployerProfileService],
})
export class EmployerProfileModule { }
