import { Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { IStorageProvider } from '../interfaces/storage-provider.interface';

export class CloudinaryProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(config: { cloudName: string; apiKey: string; apiSecret: string }) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  private resourceTypeFromContentType(contentType: string): 'video' | 'raw' | 'image' {
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('image/')) return 'image';
    return 'raw'; // PDFs, documents, etc.
  }

  private parseKey(key: string): {
    publicId: string;
    format: string;
    resourceType: 'video' | 'raw' | 'image';
  } {
    const lastDot = key.lastIndexOf('.');
    if (lastDot === -1) return { publicId: key, format: '', resourceType: 'raw' };

    const publicId = key.substring(0, lastDot);
    const format = key.substring(lastDot + 1).toLowerCase();

    const videoFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const resourceType = videoFormats.includes(format)
      ? 'video'
      : imageFormats.includes(format)
        ? 'image'
        : 'raw';

    return { publicId, format, resourceType };
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    const resourceType = this.resourceTypeFromContentType(contentType);
    const { publicId } = this.parseKey(key);

    await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: resourceType, overwrite: true },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );
      stream.end(body);
    });

    this.logger.log(`Uploaded to Cloudinary: ${key}`);
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const { publicId, format, resourceType } = this.parseKey(key);
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    return cloudinary.url(publicId, {
      resource_type: resourceType,
      format: format || undefined,
      sign_url: true,
      expires_at: expiresAt,
      secure: true,
    });
  }
}
