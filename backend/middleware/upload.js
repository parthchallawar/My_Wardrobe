const multer = require('multer');
const { uploadBuffer, isConfigured } = require('../utils/cloudinary');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_FIELD = 'image';
const IMAGES_FIELD = 'images';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file && typeof file.mimetype === 'string' && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

/**
 * Enrich a multer file object with either Cloudinary CDN data or a
 * base64 data-URL fallback (when Cloudinary env vars are absent).
 * After this call, routes can rely on:
 *   file.path       → CDN URL or data:… URI
 *   file.url        → same
 *   file.filename   → Cloudinary public_id or original filename
 *   file.width/height/format/bytes → real values or undefined
 *   file.thumbnailUrl → Cloudinary thumbnail URL or same as path
 */
async function enrichFile(file) {
  if (!file || !Buffer.isBuffer(file.buffer)) return file;

  if (isConfigured()) {
    try {
      const result = await uploadBuffer(file.buffer);
      if (result) {
        return {
          ...file,
          path: result.url,
          url: result.url,
          filename: result.publicId,
          publicId: result.publicId,
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          _cloudinary: true,
        };
      }
    } catch (err) {
      console.error('[Cloudinary] upload failed, falling back to base64:', err.message);
    }
  }

  // Fallback: base64 data URL
  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return {
    ...file,
    path: dataUrl,
    url: dataUrl,
    filename: file.originalname,
    thumbnailUrl: dataUrl,
  };
}

async function normalizeFiles(req) {
  if (req.file) {
    req.file = await enrichFile(req.file);
  }

  if (Array.isArray(req.files) && req.files.length > 0) {
    req.files = await Promise.all(req.files.map(enrichFile));
  }
}

const handleMulterError = (res, err, sizeLimitMessage) => {
  if (!err) return false;
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: sizeLimitMessage });
    return true;
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({ error: 'Unexpected file field name.' });
    return true;
  }
  res.status(400).json({ error: err.message || 'Invalid upload file' });
  return true;
};

const handleUpload = (req, res, next) => {
  upload.single(IMAGE_FIELD)(req, res, async (err) => {
    if (handleMulterError(res, err, 'File too large. Maximum 5MB allowed.')) return;
    await normalizeFiles(req);
    next();
  });
};

const handleMultipleUpload = (req, res, next) => {
  upload.array(IMAGES_FIELD, 5)(req, res, async (err) => {
    if (handleMulterError(res, err, 'File too large. Maximum 5MB allowed per file.')) return;
    await normalizeFiles(req);
    next();
  });
};

const deleteImages = async (publicIds) => {
  const { deleteByPublicIds } = require('../utils/cloudinary');
  if (publicIds?.length) await deleteByPublicIds(publicIds);
  return { deleted: publicIds || [] };
};

upload.handleUpload = handleUpload;
upload.handleMultipleUpload = handleMultipleUpload;
upload.deleteImages = deleteImages;
upload.uploadLocal = upload;
upload.default = upload;
upload.singleUpload = handleUpload;
upload.multipleUpload = handleMultipleUpload;
upload.single = upload.single.bind(upload);
upload.array = upload.array.bind(upload);

module.exports = upload;
module.exports.default = upload;
module.exports.handleUpload = handleUpload;
module.exports.handleMultipleUpload = handleMultipleUpload;
module.exports.deleteImages = deleteImages;
module.exports.uploadLocal = upload;
