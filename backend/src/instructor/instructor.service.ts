import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class InstructorService {
  private readonly logger = new Logger(InstructorService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private storage: StorageService,
  ) {}

  async createAndUploadVideo(
    _title: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{ videoId: string }> {
    const ext = mimeType.split('/')[1] ?? 'mp4';
    const key = `videos/${crypto.randomUUID()}.${ext}`;
    await this.storage.upload(key, fileBuffer, mimeType);
    this.logger.log(`Video uploaded to R2: ${key}`);
    return { videoId: key };
  }

  async getCourseForEditor(courseId: string, userId: string, role: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (role !== 'ADMIN' && course.instructorId !== userId) throw new ForbiddenException('You do not own this course');
    return course;
  }

  async getStats(instructorId: string) {
    const [courses, enrollmentAgg] = await Promise.all([
      this.prisma.course.findMany({
        where: { instructorId },
        select: {
          id: true,
          status: true,
          totalStudents: true,
          averageRating: true,
          price: true,
          enrollments: {
            select: { amountPaid: true, paymentStatus: true },
          },
        },
      }),
      this.prisma.enrollment.findMany({
        where: { course: { instructorId } },
        select: { amountPaid: true, paymentStatus: true },
      }),
    ]);

    const totalRevenue = enrollmentAgg.reduce(
      (sum, e) => sum + Number(e.amountPaid),
      0,
    );
    const totalStudents = enrollmentAgg.length;
    const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED').length;

    return {
      totalCourses: courses.length,
      publishedCourses,
      totalStudents,
      totalRevenue,
    };
  }
}
