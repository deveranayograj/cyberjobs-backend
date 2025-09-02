// shared/services/token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import { JWT_CONFIG } from '@app/core/config/jwt.config';

export interface JwtPayload {
    sub: string;
    email?: string;
    role?: UserRole;
}

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    generateAccessToken(user: User): { token: string; expiresIn: number } {
        const payload: JwtPayload = { sub: user.id.toString(), email: user.email, role: user.role };
        const expiresIn = JWT_CONFIG.access.expiresIn; // e.g. '3600s'
        return {
            token: this.jwtService.sign(payload, JWT_CONFIG.access),
            expiresIn: parseInt(expiresIn), // return seconds
        };
    }

    generateRefreshToken(user: User): string {
        const payload: JwtPayload = { sub: user.id.toString() };
        return this.jwtService.sign(payload, JWT_CONFIG.refresh);
    }

    verifyRefreshToken(refreshToken: string): JwtPayload {
        try {
            return this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: JWT_CONFIG.refresh.secret,
            });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    decodeToken(token: string): JwtPayload | null {
        const decoded = this.jwtService.decode(token);
        return decoded as JwtPayload | null;
    }
}
