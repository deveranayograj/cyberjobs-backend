import { User } from '@prisma/client';

export interface AuthResponse {
    accessToken: string;
    user: Partial<User> | any; // serialized
    redirectUrl?: string;
}
