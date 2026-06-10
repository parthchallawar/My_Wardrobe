export const extractDominantColor = (imageElement) => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Downsample to 50x50 for performance
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(imageElement, 0, 0, 50, 50);
      
      const imageData = ctx.getImageData(0, 0, 50, 50);
      const data = imageData.data;
      
      const counts = {};
      let maxCount = 0;
      let dominantRGB = { r: 0, g: 0, b: 0 };
      
      // Sample every 4th pixel: each pixel takes 4 elements (RGBA), so 4 * 4 = 16
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Ignore fully transparent pixels
        if (a < 128) continue;

        // Quantize values into buckets of 20
        const qR = Math.round(r / 20) * 20;
        const qG = Math.round(g / 20) * 20;
        const qB = Math.round(b / 20) * 20;

        const key = `${qR},${qG},${qB}`;
        counts[key] = (counts[key] || 0) + 1;

        if (counts[key] > maxCount) {
          maxCount = counts[key];
          dominantRGB = { r: qR, g: qG, b: qB };
        }
      }
      
      const { r, g, b } = dominantRGB;

      const toHex = (c) => {
        const hex = Math.min(255, Math.max(0, c)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      let name = "multicolor";

      // Map RGB to a human-readable color name
      if (r > 200 && g > 200 && b > 200) {
        name = "white";
      } else if (r < 50 && g < 50 && b < 50) {
        name = "black";
      } else if (
        Math.abs(r - g) <= 30 && Math.abs(r - b) <= 30 && Math.abs(g - b) <= 30 &&
        r >= 50 && r <= 200 && g >= 50 && g <= 200 && b >= 50 && b <= 200
      ) {
        name = "grey";
      } else if (r > 150 && g < 100 && b < 100 && r >= g && r >= b) {
        name = "red";
      } else if (b > 150 && r < 100 && g < 100 && b >= r && b >= g) {
        name = "blue";
      } else if (b > 80 && r < 60 && g < 60) {
        name = "navy";
      } else if (g > 150 && r < 100 && b < 100 && g >= r && g >= b) {
        name = "green";
      } else if (r > 200 && g > 200 && b < 100) {
        name = "yellow";
      } else if (r > 200 && g >= 80 && g <= 170 && b < 80) {
        name = "orange";
      } else if (r > 120 && b > 120 && g < 80) {
        name = "purple";
      } else if (r > 200 && g < 150 && b > 150) {
        name = "pink";
      } else if (r > 120 && g >= 60 && g <= 120 && b < 80) {
        name = "brown";
      } else if (r > 200 && g > 180 && b > 150) {
        name = "beige"; // white is already caught above
      }

      resolve({ hex, name });
    } catch (err) {
      console.error('Failed to extract color', err);
      // Fallback in case of CORS canvas tainting or decoding errors
      resolve({ hex: "#000000", name: "multicolor" });
    }
  });
};
