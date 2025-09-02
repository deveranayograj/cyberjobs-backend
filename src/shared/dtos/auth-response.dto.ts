// src/shared/dtos/auth-response.dto.ts

import { UserRole } from '@prisma/client';

/**
 * Minimal safe user object for returning in auth responses
 */
export class AuthUserDto {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    isVerified: boolean;
}

/**
 * Base response that always contains an accessToken + user
 */
export class BaseAuthResponseDto {
    accessToken: string;
    expiresIn: number;
    user: AuthUserDto;
}

/**
 * Login response – includes redirectUrl for role-based onboarding
 */
export class AuthResponseDto extends BaseAuthResponseDto {
    redirectUrl?: string;
}

/**
 * Refresh response – no redirectUrl needed
 */
export class RefreshResponseDto extends BaseAuthResponseDto { }
