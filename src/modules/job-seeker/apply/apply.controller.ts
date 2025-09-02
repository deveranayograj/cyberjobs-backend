import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApplyService } from './apply.service';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';
import { ParseBigIntQueryPipe } from '@app/core/pipes/parse-bigint-query.pipe';
import { deepSerialize } from '@app/shared/utils/serialize.util';
import { CurrentUserId } from '@app/shared/decorators/current-user-id.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SEEKER)
@Controller('applications')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) { }

  @Post('apply')
  async applyJob(
    @CurrentUserId() userId: bigint,
    @Body() dto: ApplyJobDto
  ) {
    const result = await this.applyService.applyJob(userId, dto);
    return deepSerialize(result);
  }

  @Patch('withdraw')
  async withdraw(
    @CurrentUserId() userId: bigint,
    @Body() dto: WithdrawApplicationDto
  ) {
    const result = await this.applyService.withdrawApplication(userId, dto);
    return deepSerialize(result);
  }

  @Get()
  async listApplications(@CurrentUserId() userId: bigint) {
    const apps = await this.applyService.listApplications(userId);
    return deepSerialize(apps);
  }

  @Get(':id')
  async getApplication(
    @CurrentUserId() userId: bigint,
    @Param('id', ParseBigIntQueryPipe) id: bigint,
  ) {
    const app = await this.applyService.getApplication(userId, id);
    return deepSerialize(app);
  }
}
