import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async generate(userId: string, courseId: string) {
    // Must be enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

    // No duplicate certificates
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new ConflictException('Certificate already issued');

    // All lessons must be completed
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
        totalLessons: true,
        sections: {
          select: { lessons: { select: { id: true } } },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id));
    const completedCount = await this.prisma.lessonProgress.count({
      where: { userId, lessonId: { in: allLessonIds }, isCompleted: true },
    });

    if (completedCount < allLessonIds.length) {
      throw new BadRequestException(
        `Complete all lessons first (${completedCount}/${allLessonIds.length} done)`,
      );
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    const certificateNumber = `LB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const issuedAt = new Date();

    // Generate PDF
    const pdfBuffer = await this.buildPdf({
      studentName: `${user.firstName} ${user.lastName}`,
      courseTitle: course.title,
      certificateNumber,
      issuedAt,
    });

    // Upload to R2
    const r2Key = `certificates/${userId}/${courseId}.pdf`;
    await this.storage.upload(r2Key, pdfBuffer, 'application/pdf');

    // Persist record
    return this.prisma.certificate.create({
      data: { userId, courseId, pdfUrl: r2Key, certificateNumber, issuedAt },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: { select: { title: true, slug: true, coverImage: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getDownloadUrl(userId: string, certificateId: string): Promise<{ url: string }> {
    const cert = await this.prisma.certificate.findUnique({ where: { id: certificateId } });
    if (!cert) throw new NotFoundException('Certificate not found');
    if (cert.userId !== userId) throw new ForbiddenException();

    const url = await this.storage.getSignedDownloadUrl(cert.pdfUrl, 900); // 15 min
    return { url };
  }

  // --- PDF builder ---

  private buildPdf(opts: {
    studentName: string;
    courseTitle: string;
    certificateNumber: string;
    issuedAt: Date;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const w = doc.page.width;   // 841
      const h = doc.page.height;  // 595

      // Background
      doc.rect(0, 0, w, h).fill('#070D14');

      // Border frame
      doc
        .rect(24, 24, w - 48, h - 48)
        .lineWidth(1.5)
        .strokeColor('#0EA5E9')
        .fillOpacity(0)
        .stroke();

      // Accent corners (top-left, bottom-right)
      const corner = 18;
      doc.lineWidth(3).strokeColor('#0D9488');
      // TL
      doc.moveTo(24, 24 + corner).lineTo(24, 24).lineTo(24 + corner, 24).stroke();
      // TR
      doc.moveTo(w - 24 - corner, 24).lineTo(w - 24, 24).lineTo(w - 24, 24 + corner).stroke();
      // BL
      doc.moveTo(24, h - 24 - corner).lineTo(24, h - 24).lineTo(24 + corner, h - 24).stroke();
      // BR
      doc.moveTo(w - 24 - corner, h - 24).lineTo(w - 24, h - 24).lineTo(w - 24, h - 24 - corner).stroke();

      // Brand name
      doc
        .fillColor('#0EA5E9')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('LEARNBUILD', 0, 60, { align: 'center', characterSpacing: 6 });

      // Divider
      const divY = 92;
      doc
        .moveTo(w / 2 - 80, divY)
        .lineTo(w / 2 + 80, divY)
        .lineWidth(0.5)
        .strokeColor('#0EA5E9')
        .stroke();

      // Certificate of Completion
      doc
        .fillColor('#F0F6FF')
        .font('Helvetica')
        .fontSize(11)
        .text('CERTIFICATE OF COMPLETION', 0, 106, { align: 'center', characterSpacing: 4 });

      // This certifies that
      doc
        .fillColor('#94A3B8')
        .font('Helvetica')
        .fontSize(10)
        .text('This certifies that', 0, 160, { align: 'center' });

      // Student name
      doc
        .fillColor('#F0F6FF')
        .font('Helvetica-Bold')
        .fontSize(30)
        .text(opts.studentName, 60, 180, { align: 'center' });

      // Underline under name
      const nameY = 222;
      doc
        .moveTo(w / 2 - 120, nameY)
        .lineTo(w / 2 + 120, nameY)
        .lineWidth(0.5)
        .strokeColor('#475569')
        .stroke();

      // Has successfully completed
      doc
        .fillColor('#94A3B8')
        .font('Helvetica')
        .fontSize(10)
        .text('has successfully completed the course', 0, 238, { align: 'center' });

      // Course title
      doc
        .fillColor('#0EA5E9')
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(opts.courseTitle, 80, 258, { align: 'center', width: w - 160 });

      // Footer row: date | cert number
      const footerY = h - 75;

      doc
        .moveTo(80, footerY - 12)
        .lineTo(w - 80, footerY - 12)
        .lineWidth(0.5)
        .strokeColor('#1F2C40')
        .stroke();

      doc
        .fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text('ISSUE DATE', 80, footerY, { continued: false });
      doc
        .fillColor('#F0F6FF')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(
          opts.issuedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
          80,
          footerY + 12,
        );

      doc
        .fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text('CERTIFICATE NUMBER', 0, footerY, { align: 'center' });
      doc
        .fillColor('#F0F6FF')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(opts.certificateNumber, 0, footerY + 12, { align: 'center' });

      doc
        .fillColor('#64748B')
        .font('Helvetica')
        .fontSize(8)
        .text('VERIFIED BY', w - 180, footerY, { width: 100, align: 'right' });
      doc
        .fillColor('#F0F6FF')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('learnbuild.edemaukabi.dev', w - 180, footerY + 12, { width: 100, align: 'right' });

      doc.end();
    });
  }
}
