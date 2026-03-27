const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Cloudinary storage for items
const itemImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wardrobe-ai/items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    public_id: (req, file) => `item-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
    ],
    resource_type: 'image'
  },
});

// Configure Cloudinary storage for multiple uploads
const itemMultipleImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wardrobe-ai/items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    public_id: (req, file) => `item-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
    ],
    resource_type: 'image'
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer instances
const uploadSingle = multer({
  storage: itemImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

const uploadMultiple = multer({
  storage: itemMultipleImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Max 5 files per upload
  }
});

// Old multer for backward compatibility (local storage)
const uploadLocal = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

// Middleware to handle single image upload
const handleUpload = (req, res, next) => {
  uploadSingle.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum 1 file allowed.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Middleware to handle multiple image uploads
const handleMultipleUpload = (req, res, next) => {
  uploadMultiple.array('images', 5)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum 10MB allowed per file.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Unexpected file field name. Use "images" for multiple uploads.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete multiple images from Cloudinary
const deleteImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete folder from Cloudinary
const deleteFolder = async (folder) => {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folder);
    await cloudinary.api.delete_folder(folder);
    return result;
  } catch (error) {
    console.error('Error deleting folder from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadLocal,
  handleUpload,
  handleMultipleUpload,
  deleteImage,
  deleteImages,
  deleteFolder,
  cloudinary
};
