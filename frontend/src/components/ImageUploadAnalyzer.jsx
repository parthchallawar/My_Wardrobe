import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, Info, RefreshCw } from 'lucide-react';
import { aiAPI } from '../services/api';
import { extractDominantColor } from '../utils/colorExtractor';

export default function ImageUploadAnalyzer({ onAnalysisComplete, onImageSelected }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    style: '',
    pattern: '',
    season: '',
    colorHex: '',
    colorName: ''
  });
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
      setError('');
      if (onImageSelected) {
        onImageSelected(file);
      }
    }
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const data = new FormData();
      data.append('image', selectedFile);

      const response = await aiAPI.analyzeImage(data);
      const { type, style, pattern, season, imageBase64 } = response.data.data;

      // Extract color
      const img = new Image();
      img.onload = async () => {
        const colorResult = await extractDominantColor(img);
        
        const resultData = {
          type,
          style,
          pattern,
          season,
          colorHex: colorResult.hex,
          colorName: colorResult.name
        };

        setAnalysisResult(resultData);
        setFormData(resultData);
        setIsAnalyzing(false);
      };
      img.onerror = () => {
        // Fallback if image fails to load
        const resultData = {
          type, style, pattern, season, colorHex: '#000000', colorName: 'multicolor'
        };
        setAnalysisResult(resultData);
        setFormData(resultData);
        setIsAnalyzing(false);
      };
      img.src = imageBase64;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    if (onAnalysisComplete) {
      // Pass the fully assembled data back
      onAnalysisComplete(formData);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError('');
    setFormData({
      type: '', style: '', pattern: '', season: '', colorHex: '', colorName: ''
    });
  };

  // Form Field Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col space-y-6">
      {/* Drop Zone */}
      {!analysisResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 backdrop-blur-md ${
            isDragActive ? 'border-[#39FF14] bg-[#39FF14]/10' : 'border-[#39FF14]/50 hover:border-[#39FF14]'
          }`}
        >
          <input {...getInputProps()} />
          
          {previewUrl ? (
            <div className="w-full relative flex justify-center">
              <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-xl shadow-lg border border-[#39FF14]/30" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <p className="text-white text-sm font-semibold">Click or drag to change image</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 text-center py-10">
              <div className="p-4 bg-[#39FF14]/10 rounded-full">
                <UploadCloud className="w-10 h-10 text-[#39FF14]" />
              </div>
              <div>
                <p className="text-[#39FF14] font-medium text-lg mb-1">Upload clothing image</p>
                <p className="text-gray-400 text-sm">Drag and drop or click to browse</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-xl flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={resetState}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try again</span>
          </button>
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && !isAnalyzing && !analysisResult && !error && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleAnalyze}
          className="w-full py-3 px-4 bg-[#39FF14] text-black font-bold rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:bg-[#32e612] transition-all"
        >
          Analyze with AI
        </motion.button>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <motion.button
          animate={{ boxShadow: ['0 0 10px #39FF14', '0 0 25px #39FF14', '0 0 10px #39FF14'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          disabled
          className="w-full py-3 px-4 bg-[#39FF14]/80 text-black font-bold rounded-xl flex items-center justify-center space-x-3 cursor-not-allowed"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Analyzing your outfit...</span>
        </motion.button>
      )}

      {/* Auto-filled Form */}
      {analysisResult && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full p-6 border border-[#39FF14]/30 bg-black/60 backdrop-blur-xl rounded-2xl flex flex-col space-y-5"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold text-white">AI Extraction Results</h3>
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#39FF14]/40">
              <img src={previewUrl} alt="Thumb" className="w-full h-full object-cover" />
            </div>
          </div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-1 relative">
            <label className="text-sm text-gray-400">Type</label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 pr-28 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <span className="absolute right-3 inline-flex items-center text-[#39FF14] text-[10px] uppercase font-bold bg-[#39FF14]/10 py-1 px-2 rounded">
                <Info className="w-3 h-3 mr-1" />
                {formData.type === 'unknown' ? 'Low Conf' : 'High Conf'}
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-1 relative">
            <label className="text-sm text-gray-400">Style</label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="style"
                value={formData.style}
                onChange={handleFormChange}
                className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 pr-24 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <span className="absolute right-3 inline-flex items-center text-[#39FF14] text-[10px] uppercase font-bold bg-[#39FF14]/10 py-1 px-2 rounded">
                AI Detected
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-1 relative">
            <label className="text-sm text-gray-400">Color</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-6 h-6 rounded-full border border-gray-500 shadow-sm" style={{ backgroundColor: formData.colorHex }} />
              <input
                type="text"
                name="colorName"
                value={formData.colorName}
                onChange={handleFormChange}
                className="w-full bg-black border border-gray-700 text-white rounded-lg py-3 pl-12 pr-24 focus:outline-none focus:border-[#39FF14] transition-colors capitalize"
              />
              <span className="absolute right-3 inline-flex items-center text-[#39FF14] text-[10px] uppercase font-bold bg-[#39FF14]/10 py-1 px-2 rounded">
                AI Detected
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-1 relative">
            <label className="text-sm text-gray-400">Pattern</label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="pattern"
                value={formData.pattern}
                onChange={handleFormChange}
                className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 pr-24 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <span className="absolute right-3 inline-flex items-center text-[#39FF14] text-[10px] uppercase font-bold bg-[#39FF14]/10 py-1 px-2 rounded">
                AI Detected
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col space-y-1 relative">
            <label className="text-sm text-gray-400">Season</label>
            <div className="relative flex items-center">
              <input
                type="text"
                name="season"
                value={formData.season}
                onChange={handleFormChange}
                className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 pr-24 focus:outline-none focus:border-[#39FF14] transition-colors capitalize"
              />
              <span className="absolute right-3 inline-flex items-center text-[#39FF14] text-[10px] uppercase font-bold bg-[#39FF14]/10 py-1 px-2 rounded">
                AI Detected
              </span>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={handleConfirm}
            className="w-full mt-4 py-3 px-4 bg-[#39FF14] text-black font-semibold rounded-xl hover:bg-[#32e612] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all flex justify-center items-center"
          >
            Add to Wardrobe
          </motion.button>
          
          <motion.button
            variants={itemVariants}
            onClick={resetState}
            className="w-full py-2 px-4 bg-transparent border border-gray-600 text-gray-300 font-medium rounded-xl hover:bg-gray-800 transition-all flex justify-center items-center"
          >
            Start Over
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}