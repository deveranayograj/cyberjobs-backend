import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplyService } from './apply.service';
import { ApplyJobDto } from './dtos/apply-job.dto';
import { WithdrawApplicationDto } from './dtos/withdraw-application.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) {}

  @Post('apply')
  applyJob(@Req() req, @Body() dto: ApplyJobDto) {
    return this.applyService.applyJob(BigInt(req.user.id), dto);
  }

  @Patch('withdraw')
  withdraw(@Req() req, @Body() dto: WithdrawApplicationDto) {
    return this.applyService.withdrawApplication(BigInt(req.user.id), dto);
  }

  @Get()
  listApplications(@Req() req) {
    return this.applyService.listApplications(BigInt(req.user.id));
  }

  @Get(':id')
  getApplication(@Req() req, @Param('id', ParseIntPipe) id: bigint) {
    return this.applyService.getApplication(BigInt(req.user.id), id);
  }
}
