import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { EmployerEmail } from '@app/shared/validators/employer-email.validator';
import { PasswordStrength } from '@app/shared/validators/password-strength.validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Valid email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  @EmployerEmail({
    message: 'Employer email cannot be from free / public providers (e.g., Gmail, Yahoo, Outlook, etc.)',
  })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @PasswordStrength({
    message:
      'Password must be at least 6 characters, contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsEnum(UserRole, { message: 'Role must be SEEKER or EMPLOYER' })
  role: UserRole;
}
