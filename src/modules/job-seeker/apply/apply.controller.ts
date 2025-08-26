import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplyService } from './apply.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

// DTO imports
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SEEKER)
@Controller('applications')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) { }

  /** ================= Helper: Deep serialize BigInt ================= */
  private deepSerialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map((item) => this.deepSerialize(item));
    if (typeof obj === 'object') {
      const res: any = {};
      for (const key in obj) {
        res[key] = this.deepSerialize(obj[key]);
      }
      return res;
    }
    return obj;
  }

  /** ================= Applications ================= */
  @Post('apply')
  async applyJob(@Req() req, @Body() dto: ApplyJobDto) {
    const result = await this.applyService.applyJob(BigInt(req.user.id), dto);
    return this.deepSerialize(result);
  }

  @Patch('withdraw')
  async withdraw(@Req() req, @Body() dto: WithdrawApplicationDto) {
    const result = await this.applyService.withdrawApplication(
      BigInt(req.user.id),
      dto,
    );
    return this.deepSerialize(result);
  }

  @Get()
  async listApplications(@Req() req) {
    const apps = await this.applyService.listApplications(BigInt(req.user.id));
    return this.deepSerialize(apps);
  }

  @Get(':id')
  async getApplication(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const app = await this.applyService.getApplication(
      BigInt(req.user.id),
      BigInt(id),
    );
    return this.deepSerialize(app);
  }
}
