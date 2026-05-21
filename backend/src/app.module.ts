import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PaymentModule } from './payments/payment.module';
import { CategoriesModule } from './categories/categories.module';
import { CoursesModule } from './courses/courses.module';
import { SectionsModule } from './sections/sections.module';
import { LessonsModule } from './lessons/lessons.module';
import { UsersModule } from './users/users.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ProgressModule } from './progress/progress.module';
import { NotesModule } from './notes/notes.module';
import { StorageModule } from './storage/storage.module';
import { CertificatesModule } from './certificates/certificates.module';
import { InstructorModule } from './instructor/instructor.module';
import { MailModule } from './mail/mail.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('redisUrl'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    PaymentModule,
    CategoriesModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    UsersModule,
    EnrollmentsModule,
    ProgressModule,
    NotesModule,
    StorageModule,
    CertificatesModule,
    InstructorModule,
    MailModule,
    ReviewsModule,
  ],
})
export class AppModule {}
