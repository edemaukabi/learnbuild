import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminCourseQueryDto,
  AdminUserQueryDto,
  CreateCategoryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalCourses, totalEnrollments, revenueAgg] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.aggregate({ _sum: { amountPaid: true } }),
    ]);

    const [studentCount, instructorCount, publishedCourses, draftCourses] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.INSTRUCTOR } }),
      this.prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
      this.prisma.course.count({ where: { status: CourseStatus.DRAFT } }),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: Number(revenueAgg._sum.amountPaid ?? 0),
      studentCount,
      instructorCount,
      publishedCourses,
      draftCourses,
    };
  }

  async getUsers(query: AdminUserQueryDto) {
    const { search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          _count: { select: { enrollments: true, courses: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async getCourses(query: AdminCourseQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          price: true,
          totalStudents: true,
          totalReviews: true,
          averageRating: true,
          createdAt: true,
          instructor: { select: { firstName: true, lastName: true, email: true } },
          category: { select: { name: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { data: courses, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateCourseStatus(id: string, status: CourseStatus) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({
      where: { id },
      data: {
        status,
        publishedAt: status === CourseStatus.PUBLISHED ? new Date() : undefined,
      },
      select: { id: true, title: true, status: true },
    });
  }

  // --- Category management ---

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { courses: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return this.prisma.category.create({
      data: { name: dto.name, slug, icon: dto.icon },
    });
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.prisma.category.delete({ where: { id } });
  }
}
