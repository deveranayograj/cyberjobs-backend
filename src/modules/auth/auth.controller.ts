import {
  Controller,
  Post,
  Body,
  Query,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { LoginDto } from './dtos/login.dto';
import { GoogleLoginDto } from './dtos/google-login.dto';

// 👇 Use type-only imports for Request & Response
import type { Response, Request } from 'express';

// Extend Request to include cookies
interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto.email, loginDto.password, res);
  }

  @Post('login/google')
  async googleLogin(
    @Body() googleDto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginWithGoogle(
      googleDto.email,
      googleDto.fullName,
      res,
    );
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('verify-email')
  async verifyEmailGet(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'];
    console.log('[AuthController] Refresh token from cookies:', refreshToken);

    if (!refreshToken) {
      console.error('[AuthController] No refresh token found in cookies');
      throw new UnauthorizedException('No refresh token found');
    }

    try {
      const result = await this.authService.refreshToken(refreshToken, res);
      console.log(
        '[AuthController] Refresh successful, new access token issued',
      );
      return result;
    } catch (err) {
      console.error(
        '[AuthController] Refresh token invalid or expired:',
        err.message,
      );
      throw err;
    }
  }

  @Post('logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Query('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1]; // Bearer <token>
    return this.authService.logout(BigInt(userId), res, accessToken); // ← CHANGE HERE
  }
}
