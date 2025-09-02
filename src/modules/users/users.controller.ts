import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { IUserResponse } from '@app/shared/interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Register Job-Seeker or Employer
  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    const { email, password, fullName, role } = registerDto;
    const { user, token } = await this.usersService.createUser(email, password, fullName, role);

    const response: IUserResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };

    return {
      message: 'User registered successfully. Please check your email to verify.',
      user: response,
      verificationToken: token,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(BigInt(id));
    const response: IUserResponse = {
      id: user.id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };
    return response;
  }

  // @Put(':id')
  // async updateUser(@Param('id') id: string, @Body() updateData: any) {
  //   const user = await this.usersService.updateUser(BigInt(id), updateData);
  //   return {
  //     message: 'User updated successfully',
  //     user: {
  //       id: user.id.toString(),
  //       email: user.email,
  //       fullName: user.fullName,
  //       role: user.role,
  //       status: user.status,
  //     },
  //   };
  // }

  // @Delete(':id')
  // async deleteUser(@Param('id') id: string) {
  //   const user = await this.usersService.deleteUser(BigInt(id));
  //   return {
  //     message: 'User deleted successfully',
  //     user: {
  //       id: user.id.toString(),
  //       email: user.email,
  //       fullName: user.fullName,
  //       role: user.role,
  //       status: user.status,
  //     },
  //   };
  // }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.usersService.verifyUserByToken(token);
    return {
      message: 'Email verified successfully',
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }
}
