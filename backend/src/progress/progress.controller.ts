import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post(':lessonId/toggle')
  toggle(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.progress.toggle(user.id, lessonId);
  }

  @Get('course/:courseId')
  getCourseProgress(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.progress.getCourseProgress(user.id, courseId);
  }
}
