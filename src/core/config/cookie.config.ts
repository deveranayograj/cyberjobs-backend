// core/config/cookie.config.ts
import { CookieOptions } from 'express';

export const COOKIE_CONFIG: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
