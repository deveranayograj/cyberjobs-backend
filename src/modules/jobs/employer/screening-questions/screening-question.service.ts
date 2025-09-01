import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { AddScreeningQuestionDto } from '@modules/jobs/employer/dtos/add-screening-question.dto';
import { UpdateScreeningQuestionDto } from '@modules/jobs/employer/dtos/update-screening-question.dto';
import { QuestionType } from '@prisma/client';

@Injectable()
export class ScreeningQuestionService {
  constructor(private readonly prisma: PrismaService) { }

  async create(jobId: bigint, dto: AddScreeningQuestionDto) {
    return this.prisma.screeningQuestion.create({
      data: {
        jobId,
        question: dto.question,
        type: dto.type as QuestionType,
        options: dto.options || [],
        required: dto.required ?? false,
      },
    });
  }

  async findAllByJob(jobId: bigint) {
    return this.prisma.screeningQuestion.findMany({ where: { jobId } });
  }

  async findOne(id: bigint) {
    const question = await this.prisma.screeningQuestion.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Screening question not found');
    return question;
  }

  async update(id: bigint, dto: UpdateScreeningQuestionDto) {
    await this.findOne(id);
    return this.prisma.screeningQuestion.update({
      where: { id },
      data: {
        ...dto,
        type: dto.type as QuestionType,
      },
    });
  }

  async remove(id: bigint) {
    await this.findOne(id);
    return this.prisma.screeningQuestion.delete({ where: { id } });
  }
}
