import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { ReorderDto } from './dto/reorder.dto';

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) {}

  findByCourse(courseId: string) {
    return this.prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: { orderBy: { order: 'asc' } },
      },
    });
  }

  async create(courseId: string, dto: CreateSectionDto, userId: string, role: Role) {
    await this.coursesService.verifyOwnership(courseId, userId, role);
    const count = await this.prisma.section.count({ where: { courseId } });
    return this.prisma.section.create({
      data: { courseId, title: dto.title, order: count },
    });
  }

  async update(
    courseId: string,
    id: string,
    dto: { title: string },
    userId: string,
    role: Role,
  ) {
    await this.coursesService.verifyOwnership(courseId, userId, role);
    return this.prisma.section.update({
      where: { id },
      data: { title: dto.title },
    });
  }

  async remove(courseId: string, id: string, userId: string, role: Role) {
    await this.coursesService.verifyOwnership(courseId, userId, role);
    await this.prisma.section.delete({ where: { id } });
    await this.coursesService.recalcTotals(courseId);
  }

  async reorder(courseId: string, dto: ReorderDto, userId: string, role: Role) {
    await this.coursesService.verifyOwnership(courseId, userId, role);
    await Promise.all(
      dto.items.map(({ id, order }) =>
        this.prisma.section.update({ where: { id }, data: { order } }),
      ),
    );
  }
}
