import { NotificationType, NotificationStatus, User } from '@prisma/client';

export class NotificationEntity {
    id: bigint;
    userId: bigint;
    type: NotificationType;
    message: string;
    status: NotificationStatus;
    relatedId?: bigint;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
}
