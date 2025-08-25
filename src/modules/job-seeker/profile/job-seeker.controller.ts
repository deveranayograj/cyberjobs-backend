import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobSeekerService } from '@modules/job-seeker/profile/job-seeker.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

// DTO imports
import { UpdateJobSeekerDto } from '@modules/job-seeker/profile/dtos/overview/update-job-seeker.dto';
import { UpdateLinksDto } from '@modules/job-seeker/profile/dtos/overview/update-links.dto';
import { AddSkillsDto } from '@modules/job-seeker/profile/dtos/skills/add-skills.dto';
import { RemoveSkillsDto } from '@modules/job-seeker/profile/dtos/skills/remove-skills.dto';
import { UploadResumeDto } from '@modules/job-seeker/profile/dtos/resumes/upload-resume.dto';
import { AddExperienceDto } from '@modules/job-seeker/profile/dtos/experience/add-experience.dto';
import { RemoveExperienceDto } from '@modules/job-seeker/profile/dtos/experience/remove-experience.dto';
import { UpdateExperienceDto } from '@modules/job-seeker/profile/dtos/experience/update-experience.dto';
import { AddEducationDto } from '@modules/job-seeker/profile/dtos/education/add-education.dto';
import { RemoveEducationDto } from '@modules/job-seeker/profile/dtos/education/remove-education.dto';
import { UpdateEducationDto } from '@modules/job-seeker/profile/dtos/education/update-education.dto';
import { AddCertificationDto } from '@modules/job-seeker/profile/dtos/certifications/add-certification.dto';
import { RemoveCertificationDto } from '@modules/job-seeker/profile/dtos/certifications/remove-certification.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SEEKER)
@Controller('job-seeker')
export class JobSeekerController {
  constructor(private readonly jobSeekerService: JobSeekerService) { }

  /** ================= Helper to parse BigInt ================= */
  private parseBigIntQuery(value?: string, name?: string): bigint {
    if (!value) throw new Error(`${name ?? 'ID'} query parameter missing`);
    try {
      return BigInt(value);
    } catch {
      throw new Error(`${name ?? 'ID'} must be a valid bigint`);
    }
  }

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

  /** ================= Overview & Links ================= */
  @Get('me')
  async getProfile(@Query('userId') userId: string) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const profile = await this.jobSeekerService.getProfile(id);
    return this.deepSerialize(profile);
  }

  @Patch()
  async updateOverview(
    @Query('userId') userId: string,
    @Body() dto: UpdateJobSeekerDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const updated = await this.jobSeekerService.updateOverview(id, dto);
    return this.deepSerialize(updated);
  }

  @Patch('links')
  async updateLinks(
    @Query('userId') userId: string,
    @Body() dto: UpdateLinksDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const updated = await this.jobSeekerService.updateLinks(id, dto);
    return this.deepSerialize(updated);
  }

  /** ================= Skills ================= */
  @Post('skills')
  async addSkills(@Query('userId') userId: string, @Body() dto: AddSkillsDto) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const result = await this.jobSeekerService.addSkills(id, dto);
    return this.deepSerialize(result);
  }

  @Delete('skills')
  async removeSkills(
    @Query('userId') userId: string,
    @Body() dto: RemoveSkillsDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const result = await this.jobSeekerService.removeSkills(id, dto);
    return this.deepSerialize(result);
  }

  /** ================= Resumes ================= */
  @Post('resume')
  async uploadResume(
    @Query('userId') userId: string,
    @Body() dto: UploadResumeDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const resume = await this.jobSeekerService.uploadResume(id, dto);
    return this.deepSerialize(resume);
  }

  @Delete('resume')
  async deleteResume(
    @Query('userId') userId: string,
    @Query('resumeId') resumeId: string,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const resId = this.parseBigIntQuery(resumeId, 'resumeId');
    const result = await this.jobSeekerService.deleteResume(id, resId);
    return this.deepSerialize(result);
  }

  /** ================= Experience ================= */
  @Post('experience')
  async addExperience(
    @Query('userId') userId: string,
    @Body() dto: AddExperienceDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const exp = await this.jobSeekerService.addExperience(id, dto);
    return this.deepSerialize(exp);
  }

  @Delete('experience')
  async removeExperience(
    @Query('userId') userId: string,
    @Body() dto: RemoveExperienceDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const result = await this.jobSeekerService.removeExperience(id, dto);
    return this.deepSerialize(result);
  }

  @Patch('experience')
  async updateExperience(
    @Query('userId') userId: string,
    @Query('experienceId') experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const expId = this.parseBigIntQuery(experienceId, 'experienceId');
    const updated = await this.jobSeekerService.updateExperience(
      id,
      expId,
      dto,
    );
    return this.deepSerialize(updated);
  }

  /** ================= Education ================= */
  @Post('education')
  async addEducation(
    @Query('userId') userId: string,
    @Body() dto: AddEducationDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const edu = await this.jobSeekerService.addEducation(id, dto);
    return this.deepSerialize(edu);
  }

  @Delete('education')
  async removeEducation(
    @Query('userId') userId: string,
    @Body() dto: RemoveEducationDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const result = await this.jobSeekerService.removeEducation(id, dto);
    return this.deepSerialize(result);
  }

  @Patch('education')
  async updateEducation(
    @Query('userId') userId: string,
    @Query('educationId') educationId: string,
    @Body() dto: UpdateEducationDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const eduId = this.parseBigIntQuery(educationId, 'educationId');
    const updated = await this.jobSeekerService.updateEducation(id, eduId, dto);
    return this.deepSerialize(updated);
  }

  /** ================= Certifications ================= */
  @Post('certification')
  async addCertification(
    @Query('userId') userId: string,
    @Body() dto: AddCertificationDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const cert = await this.jobSeekerService.addCertification(id, dto);
    return this.deepSerialize(cert);
  }

  @Delete('certification')
  async removeCertification(
    @Query('userId') userId: string,
    @Body() dto: RemoveCertificationDto,
  ) {
    const id = this.parseBigIntQuery(userId, 'userId');
    const result = await this.jobSeekerService.removeCertification(id, dto);
    return this.deepSerialize(result);
  }
}
