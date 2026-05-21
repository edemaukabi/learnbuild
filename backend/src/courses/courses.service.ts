import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CourseStatus, CourseLevel, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { toSlug } from '../common/utils/slug.util';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CourseQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const where: Prisma.CourseWhereInput = {
      status: CourseStatus.PUBLISHED,
      ...(query.category && { category: { slug: query.category } }),
      ...(query.level && { level: query.level as CourseLevel }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { shortDescription: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      query.sort === 'popular'
        ? { totalStudents: 'desc' }
        : query.sort === 'rating'
          ? { averageRating: 'desc' }
          : query.sort === 'price-asc'
            ? { price: 'asc' }
            : query.sort === 'price-desc'
              ? { price: 'desc' }
              : { createdAt: 'desc' };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: this.cardSelect(),
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  findFeatured() {
    return this.prisma.course.findMany({
      where: { status: CourseStatus.PUBLISHED, isFeatured: true },
      orderBy: { totalStudents: 'desc' },
      take: 6,
      select: this.cardSelect(),
    });
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            instructorProfile: {
              select: { headline: true, totalStudents: true, averageRating: true },
            },
          },
        },
      },
    });
    if (!course || course.status === CourseStatus.ARCHIVED) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async findCurriculum(slug: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      select: { id: true, instructorId: true, status: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const isOwnerOrAdmin = userId
      ? await this.isEnrolledOrOwner(course.id, userId, course.instructorId)
      : false;

    const sections = await this.prisma.section.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            type: true,
            duration: true,
            isPreview: true,
            // Only include content/videoId for enrolled users or owners
            ...(isOwnerOrAdmin && { videoId: true, content: true }),
          },
        },
      },
    });

    return sections;
  }

  async create(instructorId: string, dto: CreateCourseDto) {
    const slug = await this.uniqueSlug(dto.title);
    return this.prisma.course.create({
      data: {
        instructorId,
        slug,
        title: dto.title,
        description: dto.description,
        shortDescription: dto.shortDescription,
        categoryId: dto.categoryId,
        level: dto.level,
        language: dto.language ?? 'English',
        price: dto.price ?? 0,
        requirements: dto.requirements ?? [],
        learningOutcomes: dto.learningOutcomes ?? [],
        tags: dto.tags ?? [],
      },
    });
  }

  async update(id: string, userId: string, role: Role, dto: UpdateCourseDto) {
    await this.verifyOwnership(id, userId, role);
    return this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.shortDescription && { shortDescription: dto.shortDescription }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.level && { level: dto.level }),
        ...(dto.language && { language: dto.language }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.requirements && { requirements: dto.requirements }),
        ...(dto.learningOutcomes && { learningOutcomes: dto.learningOutcomes }),
        ...(dto.tags && { tags: dto.tags }),
      },
    });
  }

  async publish(id: string, userId: string, role: Role) {
    const course = await this.verifyOwnership(id, userId, role);
    if (course.status === CourseStatus.PUBLISHED) {
      throw new BadRequestException('Course is already published');
    }
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async remove(id: string, userId: string, role: Role) {
    await this.verifyOwnership(id, userId, role);
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.ARCHIVED },
    });
  }

  // --- Instructor dashboard ---
  findByInstructor(instructorId: string) {
    return this.prisma.course.findMany({
      where: { instructorId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...this.cardSelect(),
        status: true,
        totalStudents: true,
        totalReviews: true,
        averageRating: true,
      },
    });
  }

  // --- Shared ownership check (used by Sections/Lessons services) ---
  async verifyOwnership(courseId: string, userId: string, role: Role) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (role !== Role.ADMIN && course.instructorId !== userId) {
      throw new ForbiddenException('You do not own this course');
    }
    return course;
  }

  // --- Denormalization helpers (called after section/lesson changes) ---
  async recalcTotals(courseId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { section: { courseId } },
      select: { duration: true },
    });
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: lessons.length,
        totalDuration: lessons.reduce((s, l) => s + (l.duration ?? 0), 0),
      },
    });
  }

  private async isEnrolledOrOwner(
    courseId: string,
    userId: string,
    instructorId: string,
  ): Promise<boolean> {
    if (userId === instructorId) return true;
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });
    return !!enrollment;
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base = toSlug(title);
    let slug = base;
    let n = 1;
    while (await this.prisma.course.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }

  private cardSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      coverImage: true,
      price: true,
      level: true,
      averageRating: true,
      totalStudents: true,
      totalReviews: true,
      totalLessons: true,
      totalDuration: true,
      isFeatured: true,
      category: { select: { name: true, slug: true } },
      instructor: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    };
  }
}
