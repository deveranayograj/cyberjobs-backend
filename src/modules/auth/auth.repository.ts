import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findEmployerByUserId(userId: bigint) {
        return this.prisma.employer.findUnique({ where: { userId } });
    }

    // Add more auth-specific DB helpers as needed
    // e.g., findUserByRefreshToken, saveBlacklistedToken, etc.
}
