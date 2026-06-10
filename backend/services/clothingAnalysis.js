const OpenAI = require('openai');

// Initialize OpenAI client with NVIDIA NIM base URL
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function analyzeClothingImage(imageBuffer) {
  try {
    // Convert buffer to base64 data URI
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    const prompt = `You are an expert AI wardrobe assistant. Analyze the provided image of a clothing item. Output ONLY a valid JSON object with the following exact keys and values from the allowed sets, and NO other text or markdown formatting:
{
  "type": (choose one of: "t-shirt", "shirt", "sweater", "jacket", "vest", "pants", "shorts", "skirt", "coat", "dress", "jumpsuit", "shoes", "bag", "hat", "scarf", "belt", "unknown"),
  "style": (choose one of: "casual", "formal", "streetwear", "sportswear", "ethnic", "party", "workwear", "loungewear"),
  "pattern": (choose one of: "solid", "striped", "checkered", "floral", "graphic print", "camouflage", "abstract", "polka dots"),
  "season": (choose one of: "summer", "winter", "spring/autumn", "all")
}`;

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 1024,
      temperature: 0.1, // Low temperature for consistent JSON output
      stream: false
    });

    let resultText = response.choices[0].message.content.trim();
    
    // Clean up potential markdown formatting (e.g., ```json ... ```)
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const data = JSON.parse(resultText);
    
    // Ensure all keys exist with fallback defaults
    return {
      type: data.type || 'unknown',
      style: data.style || 'casual',
      pattern: data.pattern || 'solid',
      season: data.season || 'all'
    };

  } catch (error) {
    console.error('Error in analyzeClothingImage (NVIDIA NIM):', error.message);
    // Fallback on error
    return { type: 'unknown', style: 'casual', pattern: 'solid', season: 'all' };
  }
}

module.exports = {
  analyzeClothingImage
};
