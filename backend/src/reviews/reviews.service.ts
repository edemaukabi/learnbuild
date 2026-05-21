import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async upsert(userId: string, courseId: string, dto: UpsertReviewDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('You must be enrolled to leave a review');

    const review = await this.prisma.review.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    });

    await this.recalculateRating(courseId);
    return review;
  }

  async findByCourse(courseId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      }),
      this.prisma.review.count({ where: { courseId } }),
    ]);
    return { data: reviews, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findMyReview(userId: string, courseId: string) {
    return this.prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async delete(id: string, userId: string, userRole: Role) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Not allowed');
    }
    await this.prisma.review.delete({ where: { id } });
    await this.recalculateRating(review.courseId);
  }

  private async recalculateRating(courseId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: agg._avg.rating ?? 0,
        totalReviews: agg._count.rating,
      },
    });
  }
}
