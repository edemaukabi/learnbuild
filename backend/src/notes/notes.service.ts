import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  getForLesson(userId: string, lessonId: string) {
    return this.prisma.note.findMany({
      where: { userId, lessonId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(userId: string, lessonId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: { userId, lessonId, content: dto.content, timestamp: dto.timestamp },
    });
  }

  async update(userId: string, noteId: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException();
    return this.prisma.note.update({ where: { id: noteId }, data: { content: dto.content } });
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException();
    await this.prisma.note.delete({ where: { id: noteId } });
    return { deleted: true };
  }
}
