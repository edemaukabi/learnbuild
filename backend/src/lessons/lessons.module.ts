import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { VideoController } from './video.controller';
import { LessonsService } from './lessons.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [LessonsController, VideoController],
  providers: [LessonsService],
})
export class LessonsModule {}
