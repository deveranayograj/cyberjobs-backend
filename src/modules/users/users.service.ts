import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { MailService } from '@app/core/mail/mail.service';
import { UserRole, TokenType, User, AccountStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly mailService: MailService,
  ) { }

  /** Create a new user with verification email */
  async createUser(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ): Promise<{ user: any; token: string }> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.repo.createUser(email, hashedPassword, fullName, role);

      // Generate verification token
      const tokenStr = await this.repo.createToken(user.id, TokenType.EMAIL_VERIFICATION);

      // Send verification email
      try {
        await this.mailService.sendVerificationEmail(user.email, tokenStr);
      } catch (err) {
        throw new InternalServerErrorException('Failed to send verification email');
      }

      // Return user with stringified id
      const safeUser = { ...user, id: user.id.toString() };
      return { user: safeUser, token: tokenStr };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create user: ' + err);
    }
  }

  /** Find user by email */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.repo.findByEmail(email);
    } catch (err) {
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  /** Find user by ID including profile */
  async findById(id: bigint): Promise<User> {
    try {
      return this.repo.findById(id);
    } catch (err) {
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  /** Update user */
  async updateUser(id: bigint, data: any): Promise<User> {
    try {
      return this.repo.updateUser(id, data);
    } catch (err) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /** Soft delete user */
  async deleteUser(id: bigint): Promise<User> {
    try {
      return this.repo.deleteUser(id);
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  /** Verify user via token */
  async verifyUserByToken(tokenStr: string): Promise<User> {
    try {
      const token = await this.repo.findToken(tokenStr, TokenType.EMAIL_VERIFICATION);
      if (!token) throw new BadRequestException('Invalid or expired token');

      // Update user: mark as verified AND set status to ACTIVE
      const user = await this.repo.updateUser(token.userId, {
        isVerified: true,
        status: AccountStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      });

      // Mark the token as used
      await this.repo.markTokenUsed(token.id);

      return user;
    } catch (err) {
      throw new InternalServerErrorException('Failed to verify user');
    }
  }


  /** Save refresh token for a user */
  async saveRefreshToken(userId: bigint, refreshToken: string) {
    try {
      return this.repo.updateUser(userId, { refreshToken });
    } catch (err) {
      throw new InternalServerErrorException('Failed to save refresh token');
    }
  }

  /** Clear refresh token (logout) */
  async clearRefreshToken(userId: bigint) {
    try {
      return this.repo.updateUser(userId, { refreshToken: null });
    } catch (err) {
      throw new InternalServerErrorException('Failed to clear refresh token');
    }
  }
}
