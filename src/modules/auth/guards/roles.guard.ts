import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get roles required by the route
    const requiredRoles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Get request and strongly type user
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User not authenticated or role missing');
    }

    // Check if user role is allowed
    if (!requiredRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
