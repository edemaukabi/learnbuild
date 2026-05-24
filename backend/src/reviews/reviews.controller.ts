import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { UpsertReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':courseId')
  upsert(
    @Param('courseId') courseId: string,
    @Body() dto: UpsertReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviews.upsert(user.id, courseId, dto);
  }

  @Get(':courseId')
  findByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.reviews.findByCourse(courseId, parseInt(page), parseInt(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':courseId/mine')
  findMine(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.reviews.findMyReview(user.id, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviews.delete(id, user.id, user.role as Role);
  }
}
