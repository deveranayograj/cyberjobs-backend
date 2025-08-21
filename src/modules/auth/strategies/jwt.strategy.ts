import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const jwtFromRequest: JwtFromRequestFunction =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET, // 👈 use access secret here
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
