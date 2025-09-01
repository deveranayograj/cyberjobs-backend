import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApplyService } from './apply.service';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';
import { ParseBigIntPipe } from '@app/core/pipes/parse-bigint.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SEEKER)
@Controller('applications')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) { }

  private deepSerialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(item => this.deepSerialize(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key in obj) {
        res[key] = this.deepSerialize(obj[key]);
      }
      return res;
    }
    return obj;
  }

  @Post('apply')
  async applyJob(@Req() req, @Body() dto: ApplyJobDto) {
    const userId = BigInt(req.user.id ?? req.user.sub);
    console.log('[ApplyController] applyJob called', { userId, dto });

    const result = await this.applyService.applyJob(userId, dto);

    console.log('[ApplyController] applyJob result', result);
    return this.deepSerialize(result);
  }

  @Patch('withdraw')
  async withdraw(@Req() req, @Body() dto: WithdrawApplicationDto) {
    const userId = BigInt(req.user.id ?? req.user.sub);
    console.log('[ApplyController] withdraw called', { userId, dto });

    const result = await this.applyService.withdrawApplication(userId, dto);

    console.log('[ApplyController] withdraw result', result);
    return this.deepSerialize(result);
  }

  @Get()
  async listApplications(@Req() req) {
    const userId = BigInt(req.user.id ?? req.user.sub);
    console.log('[ApplyController] listApplications called', { userId });

    const apps = await this.applyService.listApplications(userId);

    console.log('[ApplyController] listApplications result', apps.length, 'applications');
    return this.deepSerialize(apps);
  }

  @Get(':id')
  async getApplication(@Req() req, @Param('id', ParseBigIntPipe) id: bigint) {
    const userId = BigInt(req.user.id ?? req.user.sub);
    console.log('[ApplyController] getApplication called', { userId, applicationId: id });

    const app = await this.applyService.getApplication(userId, id);

    console.log('[ApplyController] getApplication result', app);
    return this.deepSerialize(app);
  }
}
