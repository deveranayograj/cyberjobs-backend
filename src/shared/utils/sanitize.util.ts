// src/shared/utils/sanitize.util.ts
import { User } from '@prisma/client';
import { deepSerialize } from './serialize.util';

// Only keep fields safe for frontend
export function sanitizeUser(user: User) {
    if (!user) return null;

    const serialized = deepSerialize(user);

    const {
        password,
        refreshToken,
        deletedAt,
        phone,
        role,
        isVerified,
        emailVerifiedAt, status, lastLogin, createdAt, updatedAt,
        ...safeUser
    } = serialized;

    return safeUser;
}
