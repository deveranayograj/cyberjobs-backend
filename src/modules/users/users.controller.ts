import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Register Job-Seeker or Employer with centralized validation
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    const { email, password, fullName, role } = registerDto;

    const { user } = await this.usersService.createUser(
      email,
      password,
      fullName,
      role,
    );

    return {
      message:
        'User registered successfully. Please check your email to verify.',
      userId: user.id,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const userId = BigInt(id);
    return this.usersService.findById(userId);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    const userId = BigInt(id);
    return this.usersService.updateUser(userId, updateData);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const userId = BigInt(id);
    return this.usersService.deleteUser(userId);
  }
  s;

  // Verify email via token
  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token is required');
    return this.usersService.verifyUserByToken(token);
  }
}
