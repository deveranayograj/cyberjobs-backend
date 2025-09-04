import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class NotificationPreferenceDto {
    @IsOptional()
    @IsArray()
    @IsEnum(NotificationType, { each: true })
    enabledTypes?: NotificationType[];

    @IsOptional()
    instant?: boolean;

    @IsOptional()
    dailyDigest?: boolean;

    @IsOptional()
    weeklyDigest?: boolean;
}
