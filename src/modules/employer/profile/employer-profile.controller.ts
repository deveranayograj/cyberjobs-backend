import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { EmployerProfileService } from './employer-profile.service';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateEmployerProfileDto } from './dtos/update-employer-profile.dto';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user: { sub: string; role: UserRole };
}

@Controller('employer/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYER)
export class EmployerProfileController {
  constructor(private readonly profileService: EmployerProfileService) {}

  @Get()
  async getProfile(@Req() req: RequestWithUser) {
    return this.profileService.getProfile(BigInt(req.user.sub));
  }

  @Put()
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    const updated = await this.profileService.updateProfile(BigInt(req.user.sub), dto);
    return {
      message: 'Profile updated successfully',
      employer: updated,
    };
  }
}
