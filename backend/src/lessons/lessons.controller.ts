import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ReorderDto } from '../sections/dto/reorder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sections/:sectionId/lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get(':id')
  findOne(@Param('sectionId') sectionId: string, @Param('id') id: string) {
    return this.lessonsService.findOne(sectionId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post()
  create(
    @Param('sectionId') sectionId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: User,
  ) {
    return this.lessonsService.create(sectionId, dto, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('sectionId') sectionId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateLessonDto>,
    @CurrentUser() user: User,
  ) {
    return this.lessonsService.update(sectionId, id, dto, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('sectionId') sectionId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.lessonsService.remove(sectionId, id, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  reorder(
    @Param('sectionId') sectionId: string,
    @Body() dto: ReorderDto,
    @CurrentUser() user: User,
  ) {
    return this.lessonsService.reorder(sectionId, dto, user.id, user.role);
  }
}
