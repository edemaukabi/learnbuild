import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import {
  AdminCourseQueryDto,
  AdminUserQueryDto,
  CreateCategoryDto,
  UpdateCourseStatusDto,
  UpdateUserRoleDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  getStats() {
    return this.admin.getStats();
  }

  @Get('users')
  getUsers(@Query() query: AdminUserQueryDto) {
    return this.admin.getUsers(query);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.admin.updateUserRole(id, dto.role);
  }

  @Get('courses')
  getCourses(@Query() query: AdminCourseQueryDto) {
    return this.admin.getCourses(query);
  }

  @Patch('courses/:id/status')
  updateCourseStatus(@Param('id') id: string, @Body() dto: UpdateCourseStatusDto) {
    return this.admin.updateCourseStatus(id, dto.status);
  }

  @Get('categories')
  getCategories() {
    return this.admin.getCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id') id: string) {
    return this.admin.deleteCategory(id);
  }
}
