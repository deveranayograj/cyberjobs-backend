import { Module } from '@nestjs/common';
import { EmployerApplicantsController } from './employer-applicants.controller';
import { EmployerApplicantsService } from './employer-applicants.service';
import { EmployerApplicantsRepository } from './employer-applicants.repository';
import { PrismaService } from '@prisma/prisma.service';

@Module({
    controllers: [EmployerApplicantsController],
    providers: [EmployerApplicantsService, EmployerApplicantsRepository, PrismaService],
})
export class EmployerApplicantsModule { }
