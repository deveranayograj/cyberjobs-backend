import { IsNotEmpty, IsEmail } from 'class-validator';

export class GoogleLoginDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail({}, { message: 'Valid email is required' })
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;
}
