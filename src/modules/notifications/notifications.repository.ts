import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, Notification, NotificationStatus } from '@prisma/client';
import { CreateNotificationDto } from './dtos/create-notification.dto';

@Injectable()
export class NotificationsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateNotificationDto): Promise<Notification> {
        const { sendEmail, ...prismaData } = data; // exclude sendEmail
        return this.prisma.notification.create({ data: prismaData });
    }
    async findAllByUser(userId: bigint): Promise<Notification[]> {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: bigint, status: NotificationStatus): Promise<Notification> {
        return this.prisma.notification.update({
            where: { id },
            data: { status },
        });
    }

    async markAllAsRead(userId: bigint): Promise<{ count: number }> {
        const result = await this.prisma.notification.updateMany({
            where: { userId, status: NotificationStatus.UNREAD },
            data: { status: NotificationStatus.READ },
        });
        return { count: result.count };
    }
}
