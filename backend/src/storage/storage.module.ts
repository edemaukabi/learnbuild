import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService, STORAGE_PROVIDER } from './storage.service';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { R2Provider } from './providers/r2.provider';
import { IStorageProvider } from './interfaces/storage-provider.interface';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): IStorageProvider => {
        const provider = config.get<string>('storage.provider') ?? 'cloudinary';

        if (provider === 'r2') {
          return new R2Provider({
            accountId: config.get<string>('r2.accountId') ?? '',
            accessKeyId: config.get<string>('r2.accessKeyId') ?? '',
            secretAccessKey: config.get<string>('r2.secretAccessKey') ?? '',
            bucket: config.get<string>('r2.bucket') ?? 'learnbuild-assets',
          });
        }

        // Default: Cloudinary
        return new CloudinaryProvider({
          cloudName: config.get<string>('cloudinary.cloudName') ?? '',
          apiKey: config.get<string>('cloudinary.apiKey') ?? '',
          apiSecret: config.get<string>('cloudinary.apiSecret') ?? '',
        });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
