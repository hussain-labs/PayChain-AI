import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we'll pipe the buffer directly to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images are allowed.'));
    }
  },
});

// Helper: upload a buffer to Cloudinary and return the secure URL
export const uploadBufferToCloudinary = (buffer, folder = 'paychain/avatars') => {
  return new Promise((resolve, reject) => {
    const b64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${b64}`;

    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        transformation: [{ width: 300, height: 300, crop: 'fill' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', JSON.stringify(error));
          reject(new Error(error.message || 'Cloudinary upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
};

export default cloudinary;
