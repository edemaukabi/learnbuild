import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async toggle(userId: string, lessonId: string): Promise<{ completed: boolean }> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, section: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Verify enrollment
    const enrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.section.courseId } },
    });
    if (!enrolled) throw new ForbiddenException('Not enrolled in this course');

    const existing = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (existing?.isCompleted) {
      await this.prisma.lessonProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data: { isCompleted: false, completedAt: null },
      });
      return { completed: false };
    }

    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, isCompleted: true, completedAt: new Date() },
      update: { isCompleted: true, completedAt: new Date() },
    });
    return { completed: true };
  }

  async getCourseProgress(userId: string, courseId: string): Promise<{ completedLessonIds: string[] }> {
    const rows = await this.prisma.lessonProgress.findMany({
      where: {
        userId,
        isCompleted: true,
        lesson: { section: { courseId } },
      },
      select: { lessonId: true },
    });
    return { completedLessonIds: rows.map((r) => r.lessonId) };
  }
}
