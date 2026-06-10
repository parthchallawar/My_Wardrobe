const ColorThief = require('colorthief');
const axios = require('axios');

/**
 * Convert URL/local path/buffer input into a value ColorThief can read in Node.
 * Sharp (used by colorthief) cannot directly open HTTP URLs as file paths.
 * @param {string|Buffer} imageInput
 * @returns {Promise<string|Buffer>}
 */
const resolveImageInput = async (imageInput) => {
  if (Buffer.isBuffer(imageInput)) {
    return imageInput;
  }

  if (typeof imageInput !== 'string') {
    throw new Error('Invalid image input. Expected URL, file path, or Buffer');
  }

  const trimmedInput = imageInput.trim();
  if (!trimmedInput) {
    throw new Error('Image input is empty');
  }

  if (/^data:image\//i.test(trimmedInput)) {
    const base64Index = trimmedInput.indexOf('base64,');
    if (base64Index === -1) {
      throw new Error('Invalid data URL image input');
    }

    return Buffer.from(trimmedInput.slice(base64Index + 7), 'base64');
  }

  if (/^https?:\/\//i.test(trimmedInput)) {
    const response = await axios.get(trimmedInput, {
      responseType: 'arraybuffer',
      timeout: 15000
    });
    return Buffer.from(response.data);
  }

  return trimmedInput;
};

/**
 * Convert RGB values to HEX color code
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} HEX color code (e.g., #FF5733)
 */
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * Normalize ColorThief color output into numeric RGB values.
 * Supports array format [r, g, b] and object formats with r/g/b or _r/_g/_b.
 * @param {any} color
 * @returns {{r: number, g: number, b: number}}
 */
const normalizeRgb = (color) => {
  if (Array.isArray(color) && color.length >= 3) {
    return { r: color[0], g: color[1], b: color[2] };
  }

  if (color && typeof color === 'object') {
    const r = color.r ?? color._r;
    const g = color.g ?? color._g;
    const b = color.b ?? color._b;
    if ([r, g, b].every((value) => typeof value === 'number')) {
      return { r, g, b };
    }
  }

  throw new Error('Unsupported RGB format returned by color extractor');
};

/**
 * Detect dominant colors from an image URL
 * @param {string} imageUrl - URL of the image
 * @param {number} colorCount - Number of colors to extract (default: 5)
 * @returns {Promise<Array<{hex: string, rgb: {r: number, g: number, b: number}, percentage: number}>>}
 */
const detectColors = async (imageUrl, colorCount = 5) => {
  try {
    // Validate colorCount (must be between 2 and 10)
    const validColorCount = Math.max(2, Math.min(10, colorCount));
    const imageSource = await resolveImageInput(imageUrl);

    // Get the palette (array of RGB arrays)
    const palette = await ColorThief.getPalette(imageSource, validColorCount);

    if (!palette || palette.length === 0) {
      throw new Error('No colors detected from image');
    }

    // Calculate total occurrences for percentage calculation
    // ColorThief returns colors in order of dominance
    const totalColors = palette.length;

    // Map RGB arrays to our color format
    const colors = palette.map((rgb, index) => {
      const { r, g, b } = normalizeRgb(rgb);
      // Assign percentage based on dominance order
      // First color is most dominant, last is least
      const percentage = Math.round((1 - (index / (totalColors * 2))) * 100);

      return {
        hex: rgbToHex(r, g, b),
        rgb: {
          r: Math.round(r),
          g: Math.round(g),
          b: Math.round(b)
        },
        percentage: Math.max(1, percentage) // Ensure minimum 1%
      };
    });

    // Return top 3-5 colors
    return colors.slice(0, Math.min(5, colors.length));
  } catch (error) {
    console.error('Error detecting colors:', error.message);
    throw new Error(`Failed to detect colors: ${error.message}`);
  }
};

/**
 * Get the dominant color from an image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<{hex: string, rgb: {r: number, g: number, b: number}, percentage: number}>}
 */
const getDominantColor = async (imageUrl) => {
  try {
    const imageSource = await resolveImageInput(imageUrl);
    const dominantRgb = await ColorThief.getColor(imageSource);
    const { r, g, b } = normalizeRgb(dominantRgb);

    return {
      hex: rgbToHex(r, g, b),
      rgb: {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
      },
      percentage: 100
    };
  } catch (error) {
    console.error('Error getting dominant color:', error.message);
    throw new Error(`Failed to get dominant color: ${error.message}`);
  }
};

/**
 * Detect colors from multiple images and merge results
 * @param {string[]} imageUrls - Array of image URLs
 * @param {number} colorCount - Number of colors to extract per image
 * @returns {Promise<Array<{hex: string, rgb: {r: number, g: number, b: number}, percentage: number}>>}
 */
const detectColorsFromMultipleImages = async (imageUrls, colorCount = 5) => {
  try {
    if (!imageUrls || imageUrls.length === 0) {
      return [];
    }

    // Detect colors from all images in parallel
    const colorPromises = imageUrls.map(url => detectColors(url, colorCount));
    const allColorsArrays = await Promise.all(colorPromises);

    // Flatten and merge colors
    const allColors = allColorsArrays.flat();

    // Group similar colors and calculate combined percentages
    const colorMap = new Map();

    allColors.forEach(color => {
      const key = color.hex;
      if (colorMap.has(key)) {
        const existing = colorMap.get(key);
        existing.percentage += color.percentage;
      } else {
        colorMap.set(key, { ...color });
      }
    });

    // Sort by percentage (descending) and take top colors
    const mergedColors = Array.from(colorMap.values())
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
      .map(color => ({
        ...color,
        percentage: Math.round(color.percentage / imageUrls.length)
      }));

    return mergedColors;
  } catch (error) {
    console.error('Error detecting colors from multiple images:', error.message);
    throw new Error(`Failed to detect colors: ${error.message}`);
  }
};

/**
 * Validate if a URL is accessible
 * @param {string} imageUrl - URL to validate
 * @returns {Promise<boolean>}
 */
const validateImageUrl = async (imageUrl) => {
  try {
    const response = await axios.head(imageUrl, { timeout: 5000 });
    return response.status === 200 && response.headers['content-type']?.startsWith('image/');
  } catch {
    return false;
  }
};

module.exports = {
  detectColors,
  getDominantColor,
  detectColorsFromMultipleImages,
  rgbToHex,
  validateImageUrl
};
