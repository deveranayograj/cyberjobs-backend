import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read roles from both handler (method) and class level
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    this.logger.debug(
      `Required roles for this route: ${requiredRoles?.join(', ') || 'None'}`,
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No roles required, allowing access.');
      return true;
    }

    // Get request and strongly type user
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    this.logger.debug(`User payload from JWT: ${JSON.stringify(user)}`);

    if (!user || !user.role) {
      this.logger.warn('User not authenticated or role missing.');
      throw new ForbiddenException('User not authenticated or role missing');
    }

    // Check if user role is allowed
    if (!requiredRoles.includes(user.role as UserRole)) {
      this.logger.warn(
        `Access denied. User role: ${user.role}, Required: ${requiredRoles.join(
          ', ',
        )}`,
      );
      throw new ForbiddenException('Insufficient role');
    }

    this.logger.debug(`Access granted. User role: ${user.role}`);
    return true;
  }
}
