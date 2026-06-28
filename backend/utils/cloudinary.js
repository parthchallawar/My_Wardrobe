/**
 * Cloudinary upload helper.
 * If CLOUDINARY_CLOUD_NAME/_API_KEY/_API_SECRET are set, uploads the buffer
 * to Cloudinary and returns real CDN URLs + thumbnail.
 * If the env vars are absent, returns null so callers can fall back to base64.
 */

const cloudinary = require('cloudinary').v2;

const configured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('[Cloudinary] env vars not set — image uploads will fall back to base64');
}

/**
 * Upload an image buffer to Cloudinary.
 * @param {Buffer} buffer - raw image buffer from multer memoryStorage
 * @param {string} [folder='wardrobe-items'] - Cloudinary folder
 * @returns {Promise<{url, publicId, thumbnailUrl, width, height, format, bytes}|null>}
 *   Returns null when Cloudinary is not configured (caller should fall back to base64).
 */
async function uploadBuffer(buffer, folder = 'wardrobe-items') {
  if (!configured) return null;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Auto-quality and format (WebP where supported)
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);

        // Build thumbnail URL via Cloudinary transformation
        const thumbnailUrl = cloudinary.url(result.public_id, {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto',
        });

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    stream.end(buffer);
  });
}

/**
 * Delete images from Cloudinary by public_id.
 * @param {string[]} publicIds
 */
async function deleteByPublicIds(publicIds) {
  if (!configured || !publicIds?.length) return;
  await cloudinary.api.delete_resources(publicIds);
}

module.exports = { uploadBuffer, deleteByPublicIds, isConfigured: () => configured };
