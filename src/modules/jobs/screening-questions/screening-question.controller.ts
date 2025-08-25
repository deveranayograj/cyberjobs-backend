// src/modules/jobs/screening-questions/screening-question.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ScreeningQuestionService } from './screening-question.service';
import { AddScreeningQuestionDto } from '../dtos/add-screening-question.dto';
import { UpdateScreeningQuestionDto } from '../dtos/update-screening-question.dto';

@Controller('jobs/screening-questions')
export class ScreeningQuestionController {
  constructor(private readonly service: ScreeningQuestionService) {}

  @Post(':jobId')
  create(
    @Param('jobId', ParseIntPipe) jobId: bigint,
    @Body() dto: AddScreeningQuestionDto,
  ) {
    return this.service.create(jobId, dto);
  }

  @Get(':jobId')
  findAllByJob(@Param('jobId', ParseIntPipe) jobId: bigint) {
    return this.service.findAllByJob(jobId);
  }

  @Get('question/:id')
  findOne(@Param('id', ParseIntPipe) id: bigint) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: bigint,
    @Body() dto: UpdateScreeningQuestionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: bigint) {
    return this.service.remove(id);
  }
}
