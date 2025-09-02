import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { RedisService } from '@app/core/redis/redis.service';
import { AuthRepository } from '@modules/auth/auth.repository';

import {
  InvalidCredentialsException,
  EmailNotVerifiedException,
  EmployerProfileNotFoundException,
  GoogleLoginNotAllowedException,
} from '@app/core/exceptions/auth.exceptions';

import {
  AuthResponseDto,
  RefreshResponseDto,
} from '@shared/dtos/auth-response.dto';

import { toAuthUserDto } from '@shared/mappers/user.mapper';
import { COOKIE_CONFIG } from '@app/core/config/cookie.config';
import { TokenService } from '@shared/services/token.service';
import { BlacklistService } from '@app/core/redis/blacklist.service';

import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly blacklistService: BlacklistService,
  ) { }

  async login(
    email: string,
    password: string,
    res: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) throw new InvalidCredentialsException();

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new InvalidCredentialsException();
    if (!user.isVerified) throw new EmailNotVerifiedException();

    let redirectUrl: string | null = null;

    // Employer onboarding flow
    if (user.role === UserRole.EMPLOYER) {
      const employer = await this.authRepository.findEmployerByUserId(user.id);
      if (!employer) throw new EmployerProfileNotFoundException();

      switch (employer.onboardingStep) {
        case 'EMAIL_VERIFIED':
          redirectUrl = '/employer/setup';
          break;
        case 'SETUP_STARTED':
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

    // Job seeker redirect flow
    if (user.role === UserRole.SEEKER) {
      redirectUrl = '/user/profile';
    }

    const { token: accessToken, expiresIn } =
      this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    await this.usersService.saveRefreshToken(user.id, refreshToken);
    res.cookie('refreshToken', refreshToken, COOKIE_CONFIG);

    return {
      accessToken,
      expiresIn,
      user: toAuthUserDto(user),
      redirectUrl,
    };
  }

  async loginWithGoogle(
    email: string,
    fullName: string,
    res: Response,
  ): Promise<AuthResponseDto> {
    let user = await this.usersService.findByEmail(email);

    if (user && user.role !== UserRole.SEEKER) {
      throw new GoogleLoginNotAllowedException();
    }

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

    const { token: accessToken, expiresIn } =
      this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    await this.usersService.saveRefreshToken(user.id, refreshToken);
    res.cookie('refreshToken', refreshToken, COOKIE_CONFIG);

    return {
      accessToken,
      expiresIn,
      user: toAuthUserDto(user),
      redirectUrl: '/user/profile',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyUserByToken(token);

    let redirectUrl = '/dashboard';
    if (user.role === UserRole.EMPLOYER) {
      const employer = await this.authRepository.findEmployerByUserId(user.id);
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

  async refreshToken(
    refreshToken: string,
    res: Response,
  ): Promise<RefreshResponseDto> {
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(BigInt(payload.sub));
    if (!user) throw new UnauthorizedException('User not found');
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const { token: accessToken, expiresIn } =
      this.tokenService.generateAccessToken(user);
    const newRefreshToken = this.tokenService.generateRefreshToken(user);

    await this.usersService.saveRefreshToken(user.id, newRefreshToken);
    res.cookie('refreshToken', newRefreshToken, COOKIE_CONFIG);

    return {
      accessToken,
      expiresIn,
      user: toAuthUserDto(user),
    };
  }

  async logout(userId: bigint, res: Response, accessToken?: string) {
    await this.usersService.clearRefreshToken(userId);

    if (accessToken) {
      const decoded = this.tokenService.decodeToken(accessToken);
      if (decoded && 'exp' in decoded) {
        const exp = (decoded as { exp?: number }).exp;
        const expiresInMs = exp ? exp * 1000 - Date.now() : 0;
        if (expiresInMs > 0) {
          const expiresInSeconds = Math.floor(expiresInMs / 1000);
          await this.blacklistService.addToken(
            accessToken,
            userId,
            expiresInSeconds,
          );
        }
      }
    }

    res.clearCookie('refreshToken', COOKIE_CONFIG);
    return { message: 'Logged out successfully' };
  }
}
