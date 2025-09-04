import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { CurrentUserId } from '@app/shared/decorators/current-user-id.decorator';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { UpdateNotificationDto } from './dtos/update-notification.dto';
import { deepSerialize } from '@app/shared/utils/serialize.util';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) { }

    @Get()
    async getNotifications(@CurrentUserId() userId: bigint) {
        const notifications = await this.service.getUserNotifications(userId);
        return deepSerialize(notifications);
    }

    @Post()
    async createNotification(@Body() dto: CreateNotificationDto) {
        // ✅ Make sendEmail optional in DTO
        dto.sendEmail = dto.sendEmail ?? false;

        const notification = await this.service.create(dto);
        return deepSerialize(notification);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: bigint,
        @Body() dto: UpdateNotificationDto,
    ) {
        const updated = await this.service.updateStatus(id, dto);
        return deepSerialize(updated);
    }

    @Patch('mark-all-read')
    async markAllRead(@CurrentUserId() userId: bigint) {
        const result = await this.service.markAllAsRead(userId);
        return deepSerialize(result);
    }
}
