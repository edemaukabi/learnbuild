import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CertificatesService } from './certificates.service';

@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Post('generate/:courseId')
  @HttpCode(HttpStatus.CREATED)
  generate(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    return this.certificates.generate(user.id, courseId);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.certificates.listForUser(user.id);
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id') id: string, @CurrentUser() user: User) {
    return this.certificates.getDownloadUrl(user.id, id);
  }
}
