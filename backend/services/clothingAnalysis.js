const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const normalizeClothingType = (rawLabel) => {
  const label = rawLabel.toLowerCase();
  
  if (label.includes('t-shirt') || label.includes('tshirt')) return 't-shirt';
  if (label.includes('shirt')) return 'shirt';
  if (label.includes('sweater') || label.includes('cardigan')) return 'sweater';
  if (label.includes('jacket') || label.includes('blazer')) return 'jacket';
  if (label.includes('vest')) return 'vest';
  if (label.includes('pants') || label.includes('trousers') || label.includes('jeans')) return 'pants';
  if (label.includes('shorts')) return 'shorts';
  if (label.includes('skirt')) return 'skirt';
  if (label.includes('coat') || label.includes('outerwear')) return 'coat';
  if (label.includes('dress')) return 'dress';
  if (label.includes('jumpsuit') || label.includes('romper')) return 'jumpsuit';
  if (label.includes('shoe') || label.includes('sneaker') || label.includes('boot')) return 'shoes';
  if (label.includes('bag') || label.includes('purse') || label.includes('backpack')) return 'bag';
  if (label.includes('hat') || label.includes('cap')) return 'hat';
  if (label.includes('scarf')) return 'scarf';
  if (label.includes('belt')) return 'belt';
  
  return rawLabel;
};

async function detectClothingType(imageBuffer) {
  try {
    const result = await hf.objectDetection({
      model: 'valentinafeve/yolos-fashionpedia',
      data: imageBuffer
    });
    
    if (result && result.length > 0) {
      result.sort((a, b) => b.score - a.score);
      const topLabel = result[0].label;
      return normalizeClothingType(topLabel);
    }
  } catch (error) {
    console.error('Error in detectClothingType:', error.message);
  }
  return 'unknown';
}

async function detectClothingStyle(imageBuffer) {
  try {
    const result = await hf.zeroShotImageClassification({
      model: 'patrickjohncyh/fashion-clip',
      data: imageBuffer,
      parameters: {
        candidate_labels: [
          'casual wear', 'formal wear', 'streetwear', 
          'sportswear', 'ethnic wear', 'party wear', 
          'workwear', 'loungewear'
        ]
      }
    });

    if (result && result.length > 0) {
      // Sort by confidence just to be safe, although usually HF returns sorted
      result.sort((a, b) => b.score - a.score);
      const topLabel = result[0].label;
      return topLabel.replace(' wear', '');
    }
  } catch (error) {
    console.error('Error in detectClothingStyle:', error.message);
  }
  return 'casual';
}

async function detectPattern(imageBuffer) {
  try {
    const result = await hf.zeroShotImageClassification({
      model: 'patrickjohncyh/fashion-clip',
      data: imageBuffer,
      parameters: {
        candidate_labels: [
          'solid color', 'striped', 'checkered', 'floral', 
          'graphic print', 'camouflage', 'abstract pattern', 
          'polka dots'
        ]
      }
    });

    if (result && result.length > 0) {
      result.sort((a, b) => b.score - a.score);
      const topLabel = result[0].label;
      if (topLabel === 'solid color') return 'solid';
      return topLabel;
    }
  } catch (error) {
    console.error('Error in detectPattern:', error.message);
  }
  return 'solid';
}

async function detectSeason(imageBuffer) {
  try {
    const result = await hf.zeroShotImageClassification({
      model: 'patrickjohncyh/fashion-clip',
      data: imageBuffer,
      parameters: {
        candidate_labels: [
          'summer clothing light fabric', 
          'winter clothing heavy fabric', 
          'spring autumn transitional clothing', 
          'all season clothing'
        ]
      }
    });

    if (result && result.length > 0) {
      result.sort((a, b) => b.score - a.score);
      const label = result[0].label;
      
      if (label === 'summer clothing light fabric') return 'summer';
      if (label === 'winter clothing heavy fabric') return 'winter';
      if (label === 'spring autumn transitional clothing') return 'spring/autumn';
      return 'all';
    }
  } catch (error) {
    console.error('Error in detectSeason:', error.message);
  }
  return 'all';
}

async function analyzeClothingImage(imageBuffer) {
  const [type, style, pattern, season] = await Promise.all([
    detectClothingType(imageBuffer),
    detectClothingStyle(imageBuffer),
    detectPattern(imageBuffer),
    detectSeason(imageBuffer)
  ]);

  return { type, style, pattern, season };
}

module.exports = {
  analyzeClothingImage
};
