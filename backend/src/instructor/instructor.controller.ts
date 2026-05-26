import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InstructorService } from './instructor.service';
import { ApiTags } from '@nestjs/swagger';

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR, Role.ADMIN)
@ApiTags('Instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructor: InstructorService) {}

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.instructor.getStats(user.id);
  }

  @Get('courses/:id')
  getCourse(@Param('id') id: string, @CurrentUser() user: User) {
    return this.instructor.getCourseForEditor(id, user.id, user.role);
  }

  @Post('videos')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_VIDEO_SIZE } }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
  ) {
    if (!file) throw new BadRequestException('Video file is required');
    if (!title?.trim()) throw new BadRequestException('Video title is required');

    return this.instructor.createAndUploadVideo(
      title.trim(),
      file.buffer,
      file.mimetype,
    );
  }
}
