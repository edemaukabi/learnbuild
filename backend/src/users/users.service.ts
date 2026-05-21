import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { instructorProfile: true },
    });
    const { password, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { password, ...safe } = user;
    return safe;
  }

  async getDashboard(userId: string) {
    const [enrollments, certificates] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              totalLessons: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.certificate.count({ where: { userId } }),
    ]);

    const progressByEnrollment = await Promise.all(
      enrollments.map(async (e) => {
        const completed = await this.prisma.lessonProgress.count({
          where: { userId, lesson: { section: { courseId: e.courseId } }, isCompleted: true },
        });
        return { courseId: e.courseId, completed };
      }),
    );

    const progressMap = Object.fromEntries(
      progressByEnrollment.map((p) => [p.courseId, p.completed]),
    );

    return {
      totalEnrolled: enrollments.length,
      totalCertificates: certificates,
      enrollments: enrollments.map((e) => ({
        ...e,
        progress: {
          completed: progressMap[e.courseId] ?? 0,
          total: e.course.totalLessons,
          percentage:
            e.course.totalLessons > 0
              ? Math.round(((progressMap[e.courseId] ?? 0) / e.course.totalLessons) * 100)
              : 0,
        },
      })),
    };
  }
}
