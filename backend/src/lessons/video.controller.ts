import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Lessons')
@Controller('lessons')
export class VideoController {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id/video-url')
  async getVideoUrl(@Param('id') lessonId: string, @CurrentUser() user: User) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: { select: { courseId: true } },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!lesson.videoId) throw new NotFoundException('No video for this lesson');

    const courseId = lesson.section.courseId;

    // Preview lessons are accessible to all enrolled users and guests
    if (!lesson.isPreview) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } },
      });
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true },
      });
      const isInstructor = course?.instructorId === user.id;
      const isAdmin = user.role === 'ADMIN';

      if (!enrollment && !isInstructor && !isAdmin) {
        throw new ForbiddenException('Enroll in this course to watch');
      }
    }

    // Pre-signed URL valid for 2 hours
    const url = await this.storage.getSignedDownloadUrl(lesson.videoId, 7200);
    return { url };
  }
}
