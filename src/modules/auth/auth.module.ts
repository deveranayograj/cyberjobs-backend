import { Module } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { UsersModule } from '@modules/users/users.module';
import { EmployerModule } from '@modules/employer/verification/employer.module'; // ADD IF USING EmployerService
import { PrismaService } from '@prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@common/strategies/jwt.strategy';
import { RedisModule } from '@common/redis/redis.module';
import { JWT_CONFIG } from '@common/config/jwt.config';

@Module({
  imports: [
    UsersModule,
    EmployerModule, // optional if you want to use EmployerService
    JwtModule.register({
      secret: JWT_CONFIG.access.secret,
      signOptions: { expiresIn: JWT_CONFIG.access.expiresIn },
    }),
    RedisModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
