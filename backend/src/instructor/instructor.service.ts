import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstructorService {
  private readonly logger = new Logger(InstructorService.name);
  private readonly bunnyApiBase = 'https://video.bunnycdn.com';

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createAndUploadVideo(
    title: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{ videoId: string }> {
    const libraryId = this.config.get<string>('bunny.libraryId');
    const apiKey = this.config.get<string>('bunny.apiKey');

    if (!libraryId || !apiKey) {
      throw new InternalServerErrorException('Bunny.net not configured');
    }

    // Step 1: Create the video object
    let videoId: string;
    try {
      const { data } = await axios.post(
        `${this.bunnyApiBase}/library/${libraryId}/videos`,
        { title },
        { headers: { AccessKey: apiKey, 'Content-Type': 'application/json' } },
      );
      videoId = data.guid;
    } catch (err) {
      this.logger.error('Bunny create video failed', (err as AxiosError).message);
      throw new InternalServerErrorException('Failed to create video');
    }

    // Step 2: Upload the file
    try {
      await axios.put(
        `${this.bunnyApiBase}/library/${libraryId}/videos/${videoId}`,
        fileBuffer,
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': mimeType,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );
    } catch (err) {
      this.logger.error('Bunny upload video failed', (err as AxiosError).message);
      throw new InternalServerErrorException('Failed to upload video');
    }

    this.logger.log(`Video uploaded to Bunny: ${videoId}`);
    return { videoId };
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
