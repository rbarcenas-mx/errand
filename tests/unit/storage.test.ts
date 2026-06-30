import { StorageService } from '../../src/services/storage.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/real/upload.jpg' }),
      destroy: jest.fn(),
    },
  },
}));

describe('StorageService — mock branch', () => {
  const origMockEnabled = process.env.CLOUDINARY_MOCK_ENABLED;

  afterEach(() => {
    process.env.CLOUDINARY_MOCK_ENABLED = origMockEnabled;
  });

  it('should return mock URL when CLOUDINARY_MOCK_ENABLED is true', async () => {
    process.env.CLOUDINARY_MOCK_ENABLED = 'true';

    const service = new StorageService();
    const url = await service.uploadImage('/tmp/test.jpg', 'ine');

    expect(url).toMatch(/^https:\/\/res\.cloudinary\.com\/mock\/upload\/v1\/ine\/mock_\d+\.jpg$/);
  });
});
