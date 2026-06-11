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

    const prompt = `You are an expert AI wardrobe assistant. Analyze the provided image of a clothing item. Output ONLY a valid JSON object matching the exact structure below, filling in the values based on your analysis of the image. Do NOT output any markdown formatting or extra text.

{
  "identity": { "type": "string", "category": "string", "subCategory": "string", "gender_lean": "string" },
  "color": {
    "primary": { "name": "string", "family": "string", "hex": "string", "undertone": "string", "finish": "string", "brightness": "string" },
    "secondary": { "name": "string", "family": "string", "hex": "string", "coverage_percent": "number" },
    "tertiary": null,
    "isMulticolor": "boolean",
    "colorTemperature": "string",
    "dominantFamily": "string",
    "neutralCompatible": "boolean"
  },
  "pattern": { "type": "string", "scale": "string", "direction": "string", "density": "string", "isPatternBusy": "boolean", "patternContrast": "string" },
  "fit": { "silhouette": "string", "fit_type": "string", "waist_definition": "string", "taper": "string", "bodyHug": "string" },
  "construction": { "fabric": "string", "fabricWeight": "string", "stretch": "string", "transparency": "string", "texture": "string", "lining": "boolean", "sheen": "string" },
  "dimensions": { "length": "string", "sleeve": "string", "neckline": "string", "hemType": "string", "cuffs": "string" },
  "styling": { "style": "string", "formalityScore": "number", "aesthetic": ["string"], "trend": ["string"], "occasion": ["string"], "season": ["string"], "layerable": "boolean", "layerPosition": "string" },
  "matching": {
    "matchTags": ["string"],
    "pairsWellWith": { "bottoms": ["string"], "outerwear": ["string"], "footwear": ["string"], "avoid": ["string"] },
    "colorHarmony": { "complementary": ["string"], "clashes": ["string"], "neutral_safe": "boolean" },
    "versatilityScore": "number",
    "outfitRole": "string"
  },
  "condition": { "estimatedWear": "string", "careSymbols": ["string"] },
  "confidence": { "overall": "number", "color": "number", "fabric": "number", "fit": "number", "pattern": "number", "needsUserReview": ["string"] }
}`;

    console.log(`[AI Analysis] 📤 Sending image to NVIDIA NIM Vision API...`);
    console.log(`[AI Analysis] Model: meta/llama-3.2-90b-vision-instruct`);
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.2-90b-vision-instruct",
      messages: [
        {
          role: "system",
          content: "You are an expert AI wardrobe assistant. You MUST output ONLY a valid JSON object. No conversational text, no preambles, no markdown blocks. NEVER output anything other than JSON. If you cannot identify the clothing or there is an issue, still output the JSON structure with fallback/empty values."
        },
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
      max_tokens: 2048,
      temperature: 0.1, // Low temperature for consistent JSON output
      stream: false
    });

    const duration = Date.now() - startTime;
    console.log(`[AI Analysis] 📥 Received response from NVIDIA NIM in ${duration}ms`);

    let resultText = response.choices[0].message.content.trim();
    console.log(`[AI Analysis] Raw Response:`, resultText);
    
    // Clean up potential markdown formatting (e.g., \`\`\`json ... \`\`\`)
    if (resultText.startsWith('\`\`\`json')) {
      resultText = resultText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (resultText.startsWith('\`\`\`')) {
      resultText = resultText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    const data = JSON.parse(resultText);
    console.log(`[AI Analysis] ✅ Successfully parsed deep JSON data.`);
    
    // Return the full object
    return data;

  } catch (error) {
    console.error(`[AI Analysis] ❌ Error during image analysis:`, error.message);
    if (error.response) {
      console.error(`[AI Analysis] API Response Error:`, error.response.data);
    }
    // Fallback on error
    return { error: 'Failed to analyze image' };
  }
}

module.exports = {
  analyzeClothingImage
};
