import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UserRole, AccountStatus, TokenType, Prisma, User, EmployerOnboardingStep, CompanySize } from '@prisma/client';
import { randomUUID } from 'crypto';
import slugify from 'slugify';

@Injectable()
export class UsersRepository {
    constructor(private prisma: PrismaService) { }

    /** Find user by email */
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({ where: { email } });
        } catch (err) {
            throw new InternalServerErrorException('Failed to find user by email');
        }
    }

    /** Find user by ID including profile */
    async findById(id: bigint): Promise<User> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: { jobSeeker: true, employer: true },
            });
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (err) {
            throw new InternalServerErrorException('Failed to find user by ID');
        }
    }

    /** Create user and role-specific profile */
    async createUser(email: string, hashedPassword: string | null, fullName: string, role: UserRole): Promise<User> {
        try {
            const existingUser = await this.findByEmail(email);
            if (existingUser) throw new BadRequestException('Email already registered');

            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    fullName,
                    role,
                    status: AccountStatus.PENDING,
                },
            });

            if (role === UserRole.SEEKER) {
                await this.prisma.jobSeeker.create({ data: { userId: user.id } });
            } else if (role === UserRole.EMPLOYER) {
                const companySlug = slugify(fullName, { lower: true, strict: true }) + '-' + randomUUID();
                await this.prisma.employer.create({
                    data: {
                        userId: user.id,
                        slug: companySlug,
                        companyName: '',
                        industry: '',
                        companySize: CompanySize.SIZE_1_10,
                        location: '',
                        onboardingStep: EmployerOnboardingStep.EMAIL_VERIFIED,
                        isActive: true,
                        about: '',
                        contactName: '',
                        contactEmail: '',
                        values: [],
                        perksAndBenefits: [],
                        cultureHighlights: [],
                    },
                });
            }

            return user;
        } catch (err) {
            throw new InternalServerErrorException('Failed to create user: ' + err);
        }
    }

    /** Update user */
    async updateUser(id: bigint, updateData: Prisma.UserUpdateInput): Promise<User> {
        try {
            return await this.prisma.user.update({ where: { id }, data: updateData });
        } catch (err: any) {
            if (err.code === 'P2025') throw new NotFoundException('User not found');
            throw new InternalServerErrorException('Failed to update user');
        }
    }

    /** Soft delete user */
    async deleteUser(id: bigint): Promise<User> {
        try {
            return await this.prisma.user.update({
                where: { id },
                data: { status: AccountStatus.DELETED, deletedAt: new Date() },
            });
        } catch (err: any) {
            if (err.code === 'P2025') throw new NotFoundException('User not found');
            throw new InternalServerErrorException('Failed to delete user');
        }
    }

    /** Create verification or reset token */
    async createToken(userId: bigint, type: TokenType): Promise<string> {
        try {
            const token = await this.prisma.token.create({
                data: {
                    token: randomUUID(),
                    type,
                    userId,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                },
            });
            return token.token;
        } catch (err) {
            throw new InternalServerErrorException('Failed to create token');
        }
    }

    /** Mark token as used */
    async markTokenUsed(tokenId: bigint) {
        try {
            await this.prisma.token.update({ where: { id: tokenId }, data: { usedAt: new Date() } });
        } catch (err) {
            throw new InternalServerErrorException('Failed to mark token as used');
        }
    }

    /** Find token by string */
    async findToken(tokenStr: string, type: TokenType) {
        try {
            return await this.prisma.token.findUnique({ where: { token: tokenStr } });
        } catch (err) {
            throw new InternalServerErrorException('Failed to find token');
        }
    }

    /** Save refresh token for a user */
    async saveRefreshToken(userId: bigint, refreshToken: string) {
        try {
            await this.prisma.user.update({ where: { id: userId }, data: { refreshToken } });
        } catch (err) {
            throw new InternalServerErrorException('Failed to save refresh token');
        }
    }

    /** Clear refresh token (logout) */
    async clearRefreshToken(userId: bigint) {
        try {
            await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
        } catch (err) {
            throw new InternalServerErrorException('Failed to clear refresh token');
        }
    }
}
