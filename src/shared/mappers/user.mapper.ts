import { User } from '@prisma/client';
import { AuthUserDto } from '@shared/dtos/auth-response.dto';

export function toAuthUserDto(user: User): AuthUserDto {
    return {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
    };
}
