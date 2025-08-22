import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '@prisma/client';
import { Response } from 'express';
import { RedisService } from '../../common/redis/redis.service';
import { JWT_CONFIG } from '../../common/config/jwt.config';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /** Deep serialize object to convert all BigInt values to strings */
  private deepSerialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map((item) => this.deepSerialize(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key in obj) {
        res[key] = this.deepSerialize(obj[key]);
      }
      return res;
    }
    return obj;
  }

  private generateAccessToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, JWT_CONFIG.access);
  }

  private generateRefreshToken(user: User) {
    const payload = { sub: user.id.toString() };
    return this.jwtService.sign(payload, JWT_CONFIG.refresh);
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.password)
      throw new UnauthorizedException(
        'Please use Google login for this account',
      );

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) throw new UnauthorizedException('Email not verified');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.usersService.saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, user: this.deepSerialize(user) };
  }

  async loginWithGoogle(email: string, fullName: string, res: Response) {
    let user = await this.usersService.findByEmail(email);

    if (user && user.role !== UserRole.SEEKER)
      throw new BadRequestException('Google login allowed for Job-Seeker only');

    if (!user) {
      const result = await this.usersService.createUser(
        email,
        null,
        fullName,
        UserRole.SEEKER,
      );
      user = result.user;
      user.isVerified = true;
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.usersService.saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, user: this.deepSerialize(user) };
  }

  // Only showing updated / added methods
  async verifyEmail(token: string) {
    const user = await this.usersService.verifyUserByToken(token);

    let redirectUrl = '/dashboard';
    if (user.role === UserRole.EMPLOYER) {
      const employer = await this.prisma.employer.findUnique({
        where: { userId: user.id },
      });
      switch (employer.onboardingStep) {
        case 'EMAIL_VERIFIED':
        case 'SETUP_STARTED':
          redirectUrl = '/employer/setup';
          break;
        case 'SETUP_COMPLETE':
          redirectUrl = '/employer/kyc';
          break;
        case 'KYC_PENDING':
          redirectUrl = '/employer/kyc-status';
          break;
        case 'VERIFIED':
          redirectUrl = '/employer/dashboard';
          break;
      }
    }

    return { message: 'Email verified successfully', redirectUrl };
  }

  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: JWT_CONFIG.refresh.secret,
      });
      const user = await this.usersService.findById(BigInt(payload.sub));
      if (!user) throw new UnauthorizedException('User not found');

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token mismatch');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await this.usersService.saveRefreshToken(user.id, newRefreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { accessToken: newAccessToken, user: this.deepSerialize(user) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: bigint, res: Response, accessToken?: string) {
    await this.usersService.clearRefreshToken(userId);

    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken);
      if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
        const exp = (decoded as { exp?: number }).exp;
        const expiresInMs = exp ? exp * 1000 - Date.now() : 0;
        if (expiresInMs > 0) {
          const expiresInSeconds = Math.floor(expiresInMs / 1000);
          await this.redisService.set(
            `bl_${accessToken}`,
            userId.toString(),
            expiresInSeconds,
          );
        }
      }
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

    return { message: 'Logged out successfully' };
  }
}
