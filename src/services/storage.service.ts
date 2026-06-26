import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

export class StorageService {
  private cloudinaryInitialized = false;

  private initCloudinary(): void {
    if (this.cloudinaryInitialized) return;
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    this.cloudinaryInitialized = true;
  }

  async uploadImage(filePath: string, folder: string): Promise<string> {
    this.initCloudinary();
    if (env.CLOUDINARY_CLOUD_NAME === 'mock_cloud' || env.CLOUDINARY_API_KEY === 'mock_key') {
      return `https://res.cloudinary.com/mock/upload/v1/${folder}/mock_${Date.now()}.jpg`;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `mandadero/${folder}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    return result.secure_url;
  }

  async uploadMultiple(files: { filePath: string; folder: string }[]): Promise<string[]> {
    this.initCloudinary();
    const uploads = files.map((f) => this.uploadImage(f.filePath, f.folder));
    return Promise.all(uploads);
  }

  async deleteImage(publicId: string): Promise<void> {
    this.initCloudinary();
    await cloudinary.uploader.destroy(publicId);
  }
}

export const storageService = new StorageService();
