const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeClothingImage } = require('../services/clothingAnalysis');

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const aiData = await analyzeClothingImage(req.file.buffer);
    
    // Check for explicit error from AI service
    if (aiData.error) {
      return res.status(500).json({ success: false, message: aiData.error });
    }
    
    // Convert buffer to base64 data URL
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({
      success: true,
      data: {
        ...aiData,
        imageBase64
      }
    });
  } catch (error) {
    console.error('Error in analyze route:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Image analysis failed', 
      error: error.message 
    });
  }
});

module.exports = router;