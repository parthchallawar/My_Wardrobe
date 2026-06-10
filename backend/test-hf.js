require('dotenv').config();
const fs = require('fs');
const { analyzeClothingImage } = require('./services/clothingAnalysis');

async function test() {
  try {
    console.log('Testing HuggingFace API integration...');
    console.log('API Key available:', !!process.env.HUGGINGFACE_API_KEY);
    
    // Check if there is an image to test with, otherwise we'll create a dummy buffer
    // or just fetch an image from the web
    
    const imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&w=400';
    console.log('Downloading test image...');
    const axios = require('axios');
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const { HfInference } = require('@huggingface/inference');
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    
    function bufferToBlob(buffer) {
      return new Blob([buffer], { type: 'image/jpeg' });
    }

    const imageBlob = bufferToBlob(buffer);
    
    console.log('Testing facebook/bart-large-mnli for zero-shot text classification...');
    const textResult = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: 'A man wearing a blue polo shirt and khaki pants',
      parameters: { candidate_labels: ['casual clothing', 'formal clothing', 'sportswear'] }
    });
    console.log('BART Result:', textResult);

    console.log('Testing MoritzLaurer/ModernBERT-large-zeroshot-v2.0...');
    const bertResult = await hf.zeroShotClassification({
      model: 'MoritzLaurer/ModernBERT-large-zeroshot-v2.0',
      inputs: 'A man wearing a blue polo shirt and khaki pants',
      parameters: { candidate_labels: ['casual clothing', 'formal clothing', 'sportswear'] }
    });
    console.log('ModernBERT Result:', bertResult);

  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
