import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail({}, { message: 'Valid email is required' })
  email: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
