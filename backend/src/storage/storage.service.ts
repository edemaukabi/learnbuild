import { Inject, Injectable } from '@nestjs/common';
import { IStorageProvider } from './interfaces/storage-provider.interface';

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

@Injectable()
export class StorageService {
  constructor(@Inject(STORAGE_PROVIDER) private provider: IStorageProvider) {}

  upload(key: string, body: Buffer, contentType: string): Promise<void> {
    return this.provider.upload(key, body, contentType);
  }

  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    return this.provider.getSignedDownloadUrl(key, expiresInSeconds);
  }
}
