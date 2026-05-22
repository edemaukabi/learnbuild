export interface IStorageProvider {
  upload(key: string, body: Buffer, contentType: string): Promise<void>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
