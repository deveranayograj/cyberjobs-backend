import { IsEnum, IsNotEmpty } from 'class-validator';
import { NotificationStatus } from '@prisma/client';

export class UpdateNotificationDto {
    @IsNotEmpty()
    @IsEnum(NotificationStatus)
    status: NotificationStatus;
}
