import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Employer, Prisma } from '@prisma/client';

@Injectable()
export class EmployerProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: bigint): Promise<Employer | null> {
    return this.prisma.employer.findUnique({
      where: { userId },
    });
  }

  async updateByUserId(
    userId: bigint,
    data: Prisma.EmployerUpdateInput,
  ): Promise<Employer> {
    return this.prisma.employer.update({
      where: { userId },
      data,
    });
  }
}
