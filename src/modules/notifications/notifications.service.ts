import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { Notification } from '@prisma/client';
import { deepSerialize } from '@app/shared/utils/serialize.util';
import { MailService } from '@core/mail/mail.service';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly repo: NotificationsRepository,
        private readonly mailService: MailService,
        private readonly usersService: UsersService, // to fetch user email
    ) { }

    async create(dto: CreateNotificationDto): Promise<Notification> {
        const notification = await this.repo.create(dto);

        // ✅ Send email only if sendEmail flag is true
        if (dto.sendEmail) {
            const user = await this.usersService.findById(dto.userId);
            if (user?.email) {
                await this.mailService.sendMail(
                    user.email,
                    'New Notification',
                    `<p>${dto.message}</p>` // simple email body
                );
            }
        }

        return deepSerialize(notification); // ✅ serialize BigInt
    }

    async getUserNotifications(userId: bigint): Promise<Notification[]> {
        const notifications = await this.repo.findAllByUser(userId);
        return deepSerialize(notifications); // ✅ serialize BigInt
    }

    async updateStatus(id: bigint, dto: UpdateNotificationDto): Promise<Notification> {
        try {
            const updated = await this.repo.updateStatus(id, dto.status);
            return deepSerialize(updated); // ✅ serialize BigInt
        } catch (error) {
            throw new NotFoundException('Notification not found');
        }
    }

    async markAllAsRead(userId: bigint) {
        const result = await this.repo.markAllAsRead(userId);
        return deepSerialize(result); // ✅ serialize BigInt
    }
}
