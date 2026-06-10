const multer = require('multer');

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
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const toDataUrl = (file) => {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    return file;
  }

  const encoded = file.buffer.toString('base64');
  const dataUrl = `data:${file.mimetype};base64,${encoded}`;

  return {
    ...file,
    filename: file.originalname,
    path: dataUrl,
    url: dataUrl
  };
};

const normalizeFiles = (req) => {
  if (req.file) {
    req.file = toDataUrl(req.file);
  }

  if (Array.isArray(req.files)) {
    req.files = req.files.map(toDataUrl);
  }
};

const handleMulterError = (res, err, sizeLimitMessage) => {
  if (!err) {
    return false;
  }

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
  upload.single(IMAGE_FIELD)(req, res, (err) => {
    if (handleMulterError(res, err, 'File too large. Maximum 5MB allowed.')) {
      return;
    }

    normalizeFiles(req);
    next();
  });
};

const handleMultipleUpload = (req, res, next) => {
  upload.array(IMAGES_FIELD, 5)(req, res, (err) => {
    if (handleMulterError(res, err, 'File too large. Maximum 5MB allowed per file.')) {
      return;
    }

    normalizeFiles(req);
    next();
  });
};

const deleteImages = async () => ({ deleted: [] });

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
