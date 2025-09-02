import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JobSeekerService } from '@modules/job-seeker/profile/job-seeker.service';
import { JwtAuthGuard } from '@app/core/guards/jwt-auth.guard';
import { RolesGuard } from '@app/core/guards/roles.guard';
import { Roles } from '@app/shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ParseBigIntQueryPipe } from '@app/core/pipes/parse-bigint-query.pipe';
import { deepSerialize } from '@app/shared/utils/serialize.util';
import { CurrentUserId } from '@app/shared/decorators/current-user-id.decorator';

// DTO imports
import {
  UpdateJobSeekerDto,
  UpdateLinksDto,
  AddSkillsDto,
  RemoveSkillsDto,
  UploadResumeDto,
  AddExperienceDto,
  RemoveExperienceDto,
  UpdateExperienceDto,
  AddEducationDto,
  RemoveEducationDto,
  UpdateEducationDto,
  AddCertificationDto,
  RemoveCertificationDto,
} from './dtos/index';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SEEKER)
@Controller('job-seeker')
export class JobSeekerController {
  constructor(private readonly jobSeekerService: JobSeekerService) { }

  /** ================= Overview & Links ================= */
  @Get('me')
  async getProfile(@CurrentUserId() userId: bigint) {
    const profile = await this.jobSeekerService.getProfile(userId);
    return deepSerialize(profile);
  }

  @Patch()
  async updateOverview(
    @CurrentUserId() userId: bigint,
    @Body() dto: UpdateJobSeekerDto,
  ) {
    const updated = await this.jobSeekerService.updateOverview(userId, dto);
    return deepSerialize(updated);
  }

  @Patch('links')
  async updateLinks(
    @CurrentUserId() userId: bigint,
    @Body() dto: UpdateLinksDto,
  ) {
    const updated = await this.jobSeekerService.updateLinks(userId, dto);
    return deepSerialize(updated);
  }

  /** ================= Skills ================= */
  @Post('skills')
  async addSkills(@CurrentUserId() userId: bigint, @Body() dto: AddSkillsDto) {
    const result = await this.jobSeekerService.addSkills(userId, dto);
    return deepSerialize(result);
  }

  @Delete('skills')
  async removeSkills(
    @CurrentUserId() userId: bigint,
    @Body() dto: RemoveSkillsDto,
  ) {
    const result = await this.jobSeekerService.removeSkills(userId, dto);
    return deepSerialize(result);
  }

  /** ================= Resumes ================= */
  @Post('resume')
  async uploadResume(
    @CurrentUserId() userId: bigint,
    @Body() dto: UploadResumeDto,
  ) {
    const resume = await this.jobSeekerService.uploadResume(userId, dto);
    return deepSerialize(resume);
  }

  @Delete('resume')
  async deleteResume(
    @CurrentUserId() userId: bigint,
    @Query('resumeId', ParseBigIntQueryPipe) resumeId: bigint,
  ) {
    const result = await this.jobSeekerService.deleteResume(userId, resumeId);
    return deepSerialize(result);
  }

  /** ================= Experience ================= */
  @Post('experience')
  async addExperience(
    @CurrentUserId() userId: bigint,
    @Body() dto: AddExperienceDto,
  ) {
    const exp = await this.jobSeekerService.addExperience(userId, dto);
    return deepSerialize(exp);
  }

  @Delete('experience')
  async removeExperience(
    @CurrentUserId() userId: bigint,
    @Body() dto: RemoveExperienceDto,
  ) {
    const result = await this.jobSeekerService.removeExperience(userId, dto);
    return deepSerialize(result);
  }

  @Patch('experience/:experienceId')
  async updateExperience(
    @Param('experienceId', ParseBigIntQueryPipe) experienceId: bigint,
    @Body() dto: UpdateExperienceDto,
  ) {
    const updated = await this.jobSeekerService.updateExperience(
      experienceId,
      dto,
    );
    return deepSerialize(updated);
  }

  /** ================= Education ================= */
  @Post('education')
  async addEducation(
    @CurrentUserId() userId: bigint,
    @Body() dto: AddEducationDto,
  ) {
    const edu = await this.jobSeekerService.addEducation(userId, dto);
    return deepSerialize(edu);
  }

  @Delete('education')
  async removeEducation(
    @CurrentUserId() userId: bigint,
    @Body() dto: RemoveEducationDto,
  ) {
    const result = await this.jobSeekerService.removeEducation(userId, dto);
    return deepSerialize(result);
  }

  @Patch('education/:educationId')
  async updateEducation(
    @Param('educationId', ParseBigIntQueryPipe) educationId: bigint,
    @Body() dto: UpdateEducationDto,
  ) {
    const updated = await this.jobSeekerService.updateEducation(
      educationId,
      dto,
    );
    return deepSerialize(updated);
  }

  /** ================= Certifications ================= */
  @Post('certification')
  async addCertification(
    @CurrentUserId() userId: bigint,
    @Body() dto: AddCertificationDto,
  ) {
    const cert = await this.jobSeekerService.addCertification(userId, dto);
    return deepSerialize(cert);
  }

  @Delete('certification')
  async removeCertification(
    @CurrentUserId() userId: bigint,
    @Body() dto: RemoveCertificationDto,
  ) {
    const result = await this.jobSeekerService.removeCertification(userId, dto);
    return deepSerialize(result);
  }
}
