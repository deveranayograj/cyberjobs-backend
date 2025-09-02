import { Module } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { EmployerModule } from '@modules/employer/verification/employer.module'; // ADD IF USING EmployerService
import { PrismaService } from '@prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@app/core/strategies/jwt.strategy';
import { RedisModule } from '@app/core/redis/redis.module';
import { JWT_CONFIG } from '@app/core/config/jwt.config';
import { AuthRepository } from '@modules/auth/auth.repository';
import { TokenService } from '@shared/services/token.service';
import { BlacklistModule } from '@core/redis/blacklist.module';

@Module({
  imports: [
    UsersModule,
    EmployerModule, // optional if you want to use EmployerService
    JwtModule.register({
      secret: JWT_CONFIG.access.secret,
      signOptions: { expiresIn: JWT_CONFIG.access.expiresIn },
    }),
    RedisModule,
    BlacklistModule
  ],
  providers: [AuthService, AuthRepository, PrismaService, TokenService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
