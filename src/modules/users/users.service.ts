import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UserRole,
  AccountStatus,
  User,
  Prisma,
  TokenType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { MailService } from '../../common/mail/mail.service';
import slugify from 'slugify';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /** Save refresh token for a user */
  async saveRefreshToken(id: bigint, refreshToken: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { refreshToken },
      });
    } catch (err) {
      console.error('saveRefreshToken error:', err);
      throw new InternalServerErrorException('Failed to save refresh token');
    }
  }

  /** Clear refresh token (logout) */
  async clearRefreshToken(id: bigint): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { refreshToken: null },
      });
    } catch (err) {
      console.error('clearRefreshToken error:', err);
      throw new InternalServerErrorException('Failed to clear refresh token');
    }
  }

  /** Create a new user (Job-Seeker or Employer) */
  async createUser(
    email: string,
    password: string | null,
    fullName: string,
    role: UserRole,
  ): Promise<{ user: any; token: any }> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser)
        throw new BadRequestException('Email already registered');

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      // Step 1: create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role,
          status: AccountStatus.PENDING,
        },
      });

      // Step 2: create role-specific profile
      if (role === UserRole.SEEKER) {
        await this.prisma.jobSeeker.create({
          data: {
            userId: user.id,
            bio: null,
            location: null,
            profileImage: null,
            github: null,
            linkedin: null,
            personalWebsite: null,
          },
        });
      } else if (role === UserRole.EMPLOYER) {
        const companySlug =
          slugify(fullName, { lower: true, strict: true }) + '-' + randomUUID();
        await this.prisma.employer.create({
          data: {
            userId: user.id,
            companyName: '',
            slug: companySlug,
            companyLogo: null,
            bannerUrl: null,
            companyWebsite: null,
            website: '',
            industry: '',
            companySize: 'SIZE_1_10',
            foundedYear: null,
            location: '',
            about: '',
            mission: null,
            vision: null,
            values: [],
            linkedIn: null,
            twitter: null,
            facebook: null,
            instagram: null,
            youtube: null,
            glassdoor: null,
            crunchbase: null,
            contactName: '',
            contactEmail: '',
            contactPhone: null,
            contactDesignation: null,
            perksAndBenefits: [],
            hiringProcess: null,
            remoteFriendly: null,
            teamSizeInTech: null,
            cultureHighlights: [],
            isVerified: false,
            isActive: true,
            flaggedReason: null,
            onboardingStep: 'EMAIL_VERIFIED', // ✅ new
            lastVisitedStep: null, // ✅ new
          },
        });
      }

      // Step 3: create verification token
      const token = await this.prisma.token.create({
        data: {
          token: randomUUID(),
          type: TokenType.EMAIL_VERIFICATION,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
        },
      });

      console.log(`Created user ${user.email} with ID ${user.id}`);
      console.log('Generated verification token:', token.token);

      // Step 4: send email
      try {
        await this.mailService.sendVerificationEmail(user.email, token.token);
      } catch (err) {
        console.error('Failed to send verification email:', err);
        throw new InternalServerErrorException(
          'Failed to send verification email',
        );
      }

      // Convert BigInt fields to strings for JSON serialization
      const safeUser = { ...user, id: user.id.toString() };
      const safeToken = {
        ...token,
        id: token.id.toString(),
        userId: token.userId.toString(),
      };

      return { user: safeUser, token: safeToken };
    } catch (err: any) {
      console.error('createUser error:', err);
      throw new InternalServerErrorException('Failed to create user: ' + err);
    }
  }

  /** Find a user by email */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (err) {
      console.error('findByEmail error:', err);
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
      console.error('findById error:', err);
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  /** Update user */
  async updateUser(
    id: bigint,
    updateData: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.prisma.user.update({ where: { id }, data: updateData });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      )
        throw new NotFoundException('User not found');
      console.error('updateUser error:', err);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /** Soft delete */
  async deleteUser(id: bigint): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { status: AccountStatus.DELETED, deletedAt: new Date() },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      )
        throw new NotFoundException('User not found');
      console.error('deleteUser error:', err);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  /** Verify user via token */
  async verifyUserByToken(tokenStr: string): Promise<User> {
    try {
      const token = await this.prisma.token.findUnique({
        where: { token: tokenStr },
      });

      if (!token) throw new BadRequestException('Invalid or expired token');
      if (token.type !== TokenType.EMAIL_VERIFICATION)
        throw new BadRequestException('Invalid token type');
      if (token.expiresAt < new Date())
        throw new BadRequestException('Token expired');
      if (token.usedAt) throw new BadRequestException('Token already used');

      const user = await this.prisma.user.update({
        where: { id: token.userId },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
          status: AccountStatus.ACTIVE,
        },
      });

      await this.prisma.token.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      });

      return user;
    } catch (err) {
      console.error('verifyUserByToken error:', err);
      throw new InternalServerErrorException('Failed to verify user');
    }
  }
}
