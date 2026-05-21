import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ReorderDto } from '../sections/dto/reorder.dto';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) {}

  async findOne(sectionId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, sectionId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  private async getCourseIdFromSection(sectionId: string): Promise<string> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section.courseId;
  }

  async create(sectionId: string, dto: CreateLessonDto, userId: string, role: Role) {
    const courseId = await this.getCourseIdFromSection(sectionId);
    await this.coursesService.verifyOwnership(courseId, userId, role);

    const count = await this.prisma.lesson.count({ where: { sectionId } });
    const lesson = await this.prisma.lesson.create({
      data: {
        sectionId,
        title: dto.title,
        type: dto.type,
        order: count,
        isPreview: dto.isPreview ?? false,
        videoId: dto.videoId,
        content: dto.content,
        duration: dto.duration,
      },
    });

    await this.coursesService.recalcTotals(courseId);
    return lesson;
  }

  async update(
    sectionId: string,
    lessonId: string,
    dto: Partial<CreateLessonDto>,
    userId: string,
    role: Role,
  ) {
    const courseId = await this.getCourseIdFromSection(sectionId);
    await this.coursesService.verifyOwnership(courseId, userId, role);

    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.type && { type: dto.type }),
        ...(dto.isPreview !== undefined && { isPreview: dto.isPreview }),
        ...(dto.videoId !== undefined && { videoId: dto.videoId }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
      },
    });

    if (dto.duration !== undefined) {
      await this.coursesService.recalcTotals(courseId);
    }

    return lesson;
  }

  async remove(sectionId: string, lessonId: string, userId: string, role: Role) {
    const courseId = await this.getCourseIdFromSection(sectionId);
    await this.coursesService.verifyOwnership(courseId, userId, role);
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    await this.coursesService.recalcTotals(courseId);
  }

  async reorder(sectionId: string, dto: ReorderDto, userId: string, role: Role) {
    const courseId = await this.getCourseIdFromSection(sectionId);
    await this.coursesService.verifyOwnership(courseId, userId, role);
    await Promise.all(
      dto.items.map(({ id, order }) =>
        this.prisma.lesson.update({ where: { id }, data: { order } }),
      ),
    );
  }
}
