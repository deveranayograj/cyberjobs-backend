import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
