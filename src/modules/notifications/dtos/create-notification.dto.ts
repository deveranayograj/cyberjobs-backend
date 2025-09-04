import { IsNotEmpty, IsOptional, IsEnum, IsString, IsNumber, IsBoolean } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsNumber()
    userId: bigint;

    @IsNotEmpty()
    @IsEnum(NotificationType)
    type: NotificationType;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsOptional()
    @IsNumber()
    relatedId?: bigint;

    @IsOptional()
    @IsBoolean()
    sendEmail?: boolean; // ✅ optional flag to trigger email
}
