import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get('lesson/:lessonId')
  getForLesson(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.notes.getForLesson(user.id, lessonId);
  }

  @Post('lesson/:lessonId')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.notes.create(user.id, lessonId, dto);
  }

  @Patch(':noteId')
  update(
    @Param('noteId') noteId: string,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.notes.update(user.id, noteId, dto);
  }

  @Delete(':noteId')
  @HttpCode(HttpStatus.OK)
  remove(@Param('noteId') noteId: string, @CurrentUser() user: User) {
    return this.notes.remove(user.id, noteId);
  }
}
