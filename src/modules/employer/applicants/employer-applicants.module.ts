// src/modules/employer/applicants/employer-applicants.module.ts
import { Module } from '@nestjs/common';
import { EmployerApplicantsController } from './employer-applicants.controller';
import { EmployerApplicantsService } from './employer-applicants.service';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    controllers: [EmployerApplicantsController],
    providers: [EmployerApplicantsService, PrismaService],
})
export class EmployerApplicantsModule { }
