require('dotenv').config();
const { analyzeClothingImage } = require('./services/clothingAnalysis');

async function test() {
  try {
    console.log('Testing NVIDIA NIM Vision API integration...');
    console.log('API Key available:', !!process.env.NVIDIA_NIM_API_KEY);
    
    const imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&w=400';
    console.log('Downloading test image...');
    const axios = require('axios');
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    console.log('Image downloaded, running analysis via Llama 3.2 Vision...');
    console.time('analysis');
    const result = await analyzeClothingImage(buffer);
    console.timeEnd('analysis');
    
    console.log('Analysis result:');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
