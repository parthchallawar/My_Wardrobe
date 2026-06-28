/**
 * Seed wardrobe items from photos/ directory into MongoDB.
 * Run from backend/: node scripts/seedPhotos.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');

const PHOTOS_DIR = path.join(__dirname, '../../photos');
const USER_EMAIL = 'parth123@gmail.com';

// ── Clothing analysis data keyed by filename ──────────────────────────────────
const CLOTHING_DATA = [
  {
    filename: 'Brown Raglan T-Shirt,.jpg',
    name: 'Brown Raglan Graphic T-Shirt',
    category: 'tops',
    subCategory: 't-shirt',
    style: 'casual',
    fabric: 'cotton',
    patterns: ['graphic'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['casual', 'everyday'],
    tags: ['raglan', 'graphic tee', 'two-tone', 'streetwear', 'brown', 'white'],
    colors: [
      { hex: '#F5F5F0', rgb: { r: 245, g: 245, b: 240 }, percentage: 60 },
      { hex: '#4A2C1A', rgb: { r: 74, g: 44, b: 26 }, percentage: 40 }
    ],
    identity: { type: 't-shirt', category: 'tops', subCategory: 'raglan tee', gender_lean: 'male' },
    color: {
      primary: { name: 'white', family: 'neutral', hex: '#F5F5F0', undertone: 'cool', finish: 'matte', brightness: 'light' },
      secondary: { name: 'dark brown', family: 'brown', hex: '#4A2C1A', coverage_percent: 40 },
      isMulticolor: true, colorTemperature: 'neutral', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'graphic', scale: 'small', direction: 'center', density: 'low', isPatternBusy: false, patternContrast: 'high' },
    fit: { silhouette: 'regular', fit_type: 'regular', waist_definition: 'none', taper: 'straight', bodyHug: 'relaxed' },
    construction: { fabric: 'cotton', fabricWeight: 'medium', stretch: 'low', transparency: 'opaque', texture: 'smooth', lining: false, sheen: 'matte' },
    dimensions: { length: 'regular', sleeve: 'short', neckline: 'crew neck', hemType: 'straight', cuffs: 'ribbed' },
    styling: { style: 'casual', formalityScore: 2, aesthetic: ['streetwear', 'y2k'], trend: ['graphic tee', 'colorblock raglan'], occasion: ['casual', 'everyday'], season: ['spring', 'summer', 'fall'], layerable: true, layerPosition: 'base' },
    matching: {
      matchTags: ['brown', 'white', 'casual', 'graphic'],
      pairsWellWith: { bottoms: ['black jeans', 'brown pants', 'cargo pants'], outerwear: ['bomber jacket', 'denim jacket'], footwear: ['sneakers', 'canvas shoes'], avoid: ['formal trousers'] },
      colorHarmony: { complementary: ['black', 'tan', 'beige'], clashes: ['neon colors'], neutral_safe: true },
      versatilityScore: 7, outfitRole: 'statement'
    },
    confidence: { overall: 0.95, color: 0.98, fabric: 0.9, fit: 0.85, pattern: 0.95, needsUserReview: [] }
  },
  {
    filename: 'DENIM CARPENTER PANTS (K5) [BROWN].jpg',
    name: 'Brown Denim Carpenter Pants',
    category: 'bottoms',
    subCategory: 'carpenter pants',
    style: 'casual',
    fabric: 'denim',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall', 'winter'],
    occasion: ['casual', 'everyday', 'outdoor'],
    tags: ['carpenter', 'utility', 'wide-leg', 'brown denim', 'workwear'],
    colors: [
      { hex: '#8B7355', rgb: { r: 139, g: 115, b: 85 }, percentage: 92 }
    ],
    identity: { type: 'carpenter pants', category: 'bottoms', subCategory: 'utility pants', gender_lean: 'male' },
    color: {
      primary: { name: 'khaki brown', family: 'brown', hex: '#8B7355', undertone: 'warm', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'brown', neutralCompatible: true
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'wide', fit_type: 'relaxed', waist_definition: 'mid-rise', taper: 'straight', bodyHug: 'loose' },
    construction: { fabric: 'denim', fabricWeight: 'heavy', stretch: 'none', transparency: 'opaque', texture: 'twill', lining: false, sheen: 'matte' },
    dimensions: { length: 'full', sleeve: 'none', neckline: 'none', hemType: 'straight', cuffs: 'open' },
    styling: { style: 'casual', formalityScore: 2, aesthetic: ['workwear', 'utility', 'gorpcore'], trend: ['carpenter pants', 'wide-leg denim'], occasion: ['casual', 'everyday', 'outdoor'], season: ['spring', 'summer', 'fall', 'winter'], layerable: false, layerPosition: 'bottom' },
    matching: {
      matchTags: ['brown', 'utility', 'carpenter', 'wide-leg'],
      pairsWellWith: { bottoms: [], outerwear: ['hoodie', 'flannel shirt', 'denim jacket', 'bomber'], footwear: ['sneakers', 'boots', 'work boots'], avoid: ['formal shoes', 'dress shoes'] },
      colorHarmony: { complementary: ['white', 'cream', 'black', 'rust'], clashes: ['neon'], neutral_safe: true },
      versatilityScore: 7, outfitRole: 'foundation'
    },
    confidence: { overall: 0.95, color: 0.9, fabric: 0.92, fit: 0.88, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 'download (1).jpg',
    name: 'Rust Corduroy Button-Down Shirt',
    category: 'tops',
    subCategory: 'shirt',
    style: 'casual',
    fabric: 'corduroy',
    patterns: ['solid'],
    season: ['fall', 'winter'],
    occasion: ['casual', 'everyday', 'smart casual'],
    tags: ['corduroy', 'rust', 'burnt orange', 'long sleeve', 'button-down', 'fall'],
    colors: [
      { hex: '#8B3A10', rgb: { r: 139, g: 58, b: 16 }, percentage: 95 }
    ],
    identity: { type: 'shirt', category: 'tops', subCategory: 'casual shirt', gender_lean: 'male' },
    color: {
      primary: { name: 'rust orange', family: 'orange', hex: '#8B3A10', undertone: 'warm', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'orange', neutralCompatible: false
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'regular', fit_type: 'regular', waist_definition: 'none', taper: 'straight', bodyHug: 'relaxed' },
    construction: { fabric: 'corduroy', fabricWeight: 'medium-heavy', stretch: 'low', transparency: 'opaque', texture: 'ridged', lining: false, sheen: 'slight' },
    dimensions: { length: 'regular', sleeve: 'long', neckline: 'spread collar', hemType: 'curved', cuffs: 'button cuffs' },
    styling: { style: 'casual', formalityScore: 4, aesthetic: ['vintage', 'autumnal', 'preppy'], trend: ['corduroy', 'earthy tones'], occasion: ['casual', 'everyday', 'smart casual'], season: ['fall', 'winter'], layerable: true, layerPosition: 'mid' },
    matching: {
      matchTags: ['rust', 'warm', 'corduroy', 'fall'],
      pairsWellWith: { bottoms: ['brown pants', 'black jeans', 'dark denim', 'khaki chinos'], outerwear: ['brown jacket', 'puffer vest'], footwear: ['boots', 'loafers', 'desert boots'], avoid: ['bright colors', 'neon'] },
      colorHarmony: { complementary: ['navy', 'dark brown', 'cream', 'mustard'], clashes: ['red', 'pink'], neutral_safe: false },
      versatilityScore: 6, outfitRole: 'statement'
    },
    confidence: { overall: 0.93, color: 0.95, fabric: 0.94, fit: 0.88, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 'download (2).jpg',
    name: 'White Striped Linen Shirt',
    category: 'tops',
    subCategory: 'shirt',
    brand: 'Zara',
    style: 'casual',
    fabric: 'linen',
    patterns: ['vertical stripes'],
    season: ['spring', 'summer'],
    occasion: ['casual', 'everyday', 'smart casual', 'beach'],
    tags: ['linen', 'stripes', 'white', 'summer', 'Zara', 'button-down', 'relaxed'],
    colors: [
      { hex: '#F0EDE8', rgb: { r: 240, g: 237, b: 232 }, percentage: 65 },
      { hex: '#7A7A7A', rgb: { r: 122, g: 122, b: 122 }, percentage: 25 },
      { hex: '#8B6B4A', rgb: { r: 139, g: 107, b: 74 }, percentage: 10 }
    ],
    identity: { type: 'shirt', category: 'tops', subCategory: 'casual shirt', gender_lean: 'male' },
    color: {
      primary: { name: 'off-white', family: 'neutral', hex: '#F0EDE8', undertone: 'warm', finish: 'matte', brightness: 'light' },
      secondary: { name: 'grey', family: 'neutral', hex: '#7A7A7A', coverage_percent: 25 },
      isMulticolor: true, colorTemperature: 'neutral', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'stripes', scale: 'medium', direction: 'vertical', density: 'medium', isPatternBusy: false, patternContrast: 'medium' },
    fit: { silhouette: 'relaxed', fit_type: 'oversized', waist_definition: 'none', taper: 'straight', bodyHug: 'loose' },
    construction: { fabric: 'linen', fabricWeight: 'light', stretch: 'none', transparency: 'semi-opaque', texture: 'textured', lining: false, sheen: 'matte' },
    dimensions: { length: 'regular', sleeve: 'long', neckline: 'button-down collar', hemType: 'curved', cuffs: 'button cuffs' },
    styling: { style: 'casual', formalityScore: 3, aesthetic: ['coastal', 'relaxed', 'minimal'], trend: ['linen shirts', 'summer essentials'], occasion: ['casual', 'everyday', 'smart casual', 'beach'], season: ['spring', 'summer'], layerable: true, layerPosition: 'base' },
    matching: {
      matchTags: ['white', 'stripes', 'linen', 'summer'],
      pairsWellWith: { bottoms: ['white chinos', 'navy shorts', 'linen trousers', 'light jeans'], outerwear: [], footwear: ['loafers', 'espadrilles', 'sandals', 'white sneakers'], avoid: ['heavy fabrics'] },
      colorHarmony: { complementary: ['navy', 'tan', 'beige', 'light blue'], clashes: ['busy patterns', 'neon'], neutral_safe: true },
      versatilityScore: 9, outfitRole: 'foundation'
    },
    confidence: { overall: 0.96, color: 0.94, fabric: 0.92, fit: 0.87, pattern: 0.97, needsUserReview: [] }
  },
  {
    filename: 'download (3).jpg',
    name: 'Cream Polo Shirt',
    category: 'tops',
    subCategory: 'polo',
    brand: 'Polo',
    style: 'smart casual',
    fabric: 'cotton pique',
    patterns: ['solid'],
    season: ['spring', 'summer'],
    occasion: ['casual', 'smart casual', 'golf', 'weekend'],
    tags: ['polo', 'cream', 'beige', 'smart casual', 'short sleeve', 'embroidered logo'],
    colors: [
      { hex: '#F5EDD5', rgb: { r: 245, g: 237, b: 213 }, percentage: 88 },
      { hex: '#6B3A1A', rgb: { r: 107, g: 58, b: 26 }, percentage: 12 }
    ],
    identity: { type: 'polo shirt', category: 'tops', subCategory: 'polo', gender_lean: 'male' },
    color: {
      primary: { name: 'cream', family: 'neutral', hex: '#F5EDD5', undertone: 'warm', finish: 'matte', brightness: 'light' },
      secondary: { name: 'brown', family: 'brown', hex: '#6B3A1A', coverage_percent: 12 },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'regular', fit_type: 'regular', waist_definition: 'slight', taper: 'slight', bodyHug: 'semi-fitted' },
    construction: { fabric: 'cotton pique', fabricWeight: 'medium', stretch: 'low', transparency: 'opaque', texture: 'pique', lining: false, sheen: 'slight' },
    dimensions: { length: 'regular', sleeve: 'short', neckline: 'polo collar', hemType: 'straight', cuffs: 'ribbed' },
    styling: { style: 'smart casual', formalityScore: 5, aesthetic: ['preppy', 'classic', 'clean'], trend: ['polo renaissance', 'quiet luxury'], occasion: ['casual', 'smart casual', 'golf', 'weekend'], season: ['spring', 'summer'], layerable: false, layerPosition: 'base' },
    matching: {
      matchTags: ['cream', 'polo', 'smart casual', 'classic'],
      pairsWellWith: { bottoms: ['navy chinos', 'brown trousers', 'white shorts', 'khaki pants'], outerwear: ['navy blazer', 'light cardigan'], footwear: ['loafers', 'boat shoes', 'white sneakers', 'suede shoes'], avoid: ['cargo pants', 'heavy boots'] },
      colorHarmony: { complementary: ['navy', 'brown', 'tan', 'olive'], clashes: ['neon', 'bright red'], neutral_safe: true },
      versatilityScore: 8, outfitRole: 'foundation'
    },
    confidence: { overall: 0.95, color: 0.97, fabric: 0.91, fit: 0.89, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 'download (4).jpg',
    name: 'Dark Green Zip Polo Shirt',
    category: 'tops',
    subCategory: 'polo',
    style: 'streetwear',
    fabric: 'knit',
    patterns: ['vertical stripes'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['casual', 'streetwear', 'everyday'],
    tags: ['polo', 'green', 'zip', 'stripes', 'streetwear', 'knit', 'short sleeve'],
    colors: [
      { hex: '#1B5E40', rgb: { r: 27, g: 94, b: 64 }, percentage: 72 },
      { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, percentage: 28 }
    ],
    identity: { type: 'polo shirt', category: 'tops', subCategory: 'zip polo', gender_lean: 'male' },
    color: {
      primary: { name: 'forest green', family: 'green', hex: '#1B5E40', undertone: 'cool', finish: 'matte', brightness: 'dark' },
      secondary: { name: 'white', family: 'neutral', hex: '#FFFFFF', coverage_percent: 28 },
      isMulticolor: true, colorTemperature: 'cool', dominantFamily: 'green', neutralCompatible: false
    },
    pattern: { type: 'stripes', scale: 'medium', direction: 'vertical', density: 'low', isPatternBusy: false, patternContrast: 'high' },
    fit: { silhouette: 'regular', fit_type: 'regular', waist_definition: 'none', taper: 'straight', bodyHug: 'relaxed' },
    construction: { fabric: 'knit', fabricWeight: 'medium', stretch: 'medium', transparency: 'opaque', texture: 'ribbed knit', lining: false, sheen: 'slight' },
    dimensions: { length: 'regular', sleeve: 'short', neckline: 'polo collar with zip', hemType: 'straight', cuffs: 'ribbed' },
    styling: { style: 'streetwear', formalityScore: 3, aesthetic: ['streetwear', 'sport-luxe', 'Y2K'], trend: ['zip polo', 'knit polo'], occasion: ['casual', 'streetwear', 'everyday'], season: ['spring', 'summer', 'fall'], layerable: false, layerPosition: 'base' },
    matching: {
      matchTags: ['green', 'white', 'polo', 'streetwear', 'zip'],
      pairsWellWith: { bottoms: ['black pants', 'white shorts', 'dark jeans', 'cargo pants'], outerwear: ['black jacket', 'track jacket'], footwear: ['chunky sneakers', 'white sneakers', 'Jordan 1s'], avoid: ['formal trousers', 'dress shoes'] },
      colorHarmony: { complementary: ['black', 'white', 'cream', 'khaki'], clashes: ['red', 'pink', 'orange'], neutral_safe: false },
      versatilityScore: 6, outfitRole: 'statement'
    },
    confidence: { overall: 0.93, color: 0.97, fabric: 0.88, fit: 0.86, pattern: 0.95, needsUserReview: [] }
  },
  {
    filename: 'felirbe-OCmNJnFx44U-unsplash.jpg',
    name: 'Brown Camo Slim Jogger Pants',
    category: 'bottoms',
    subCategory: 'jogger pants',
    style: 'streetwear',
    fabric: 'cotton',
    patterns: ['camouflage'],
    season: ['spring', 'fall'],
    occasion: ['casual', 'streetwear', 'everyday'],
    tags: ['camo', 'camouflage', 'joggers', 'slim', 'brown', 'streetwear'],
    colors: [
      { hex: '#6B4226', rgb: { r: 107, g: 66, b: 38 }, percentage: 50 },
      { hex: '#8B7355', rgb: { r: 139, g: 115, b: 85 }, percentage: 35 },
      { hex: '#3D2B1A', rgb: { r: 61, g: 43, b: 26 }, percentage: 15 }
    ],
    identity: { type: 'jogger pants', category: 'bottoms', subCategory: 'joggers', gender_lean: 'male' },
    color: {
      primary: { name: 'medium brown', family: 'brown', hex: '#6B4226', undertone: 'warm', finish: 'matte', brightness: 'medium' },
      secondary: { name: 'khaki', family: 'brown', hex: '#8B7355', coverage_percent: 35 },
      isMulticolor: true, colorTemperature: 'warm', dominantFamily: 'brown', neutralCompatible: false
    },
    pattern: { type: 'camouflage', scale: 'medium', direction: 'allover', density: 'high', isPatternBusy: true, patternContrast: 'medium' },
    fit: { silhouette: 'tapered', fit_type: 'slim', waist_definition: 'elastic', taper: 'tapered', bodyHug: 'fitted' },
    construction: { fabric: 'cotton', fabricWeight: 'medium', stretch: 'low', transparency: 'opaque', texture: 'smooth', lining: false, sheen: 'matte' },
    dimensions: { length: 'full', sleeve: 'none', neckline: 'none', hemType: 'tapered cuff', cuffs: 'elastic' },
    styling: { style: 'streetwear', formalityScore: 2, aesthetic: ['streetwear', 'military-inspired', 'casual'], trend: ['camo', 'jogger trend'], occasion: ['casual', 'streetwear', 'everyday'], season: ['spring', 'fall'], layerable: false, layerPosition: 'bottom' },
    matching: {
      matchTags: ['camo', 'brown', 'casual', 'streetwear'],
      pairsWellWith: { bottoms: [], outerwear: ['black hoodie', 'white tee', 'brown t-shirt', 'bomber jacket'], footwear: ['sneakers', 'high-top sneakers', 'boots'], avoid: ['formal tops', 'dress shirts'] },
      colorHarmony: { complementary: ['black', 'white', 'olive', 'tan'], clashes: ['other patterns', 'neon'], neutral_safe: false },
      versatilityScore: 5, outfitRole: 'statement'
    },
    confidence: { overall: 0.92, color: 0.9, fabric: 0.88, fit: 0.87, pattern: 0.95, needsUserReview: [] }
  },
  {
    filename: 'HERE&amp;NOW Tartan Checks Spread Collar Long Sleeves Slim Fit Cotton Casual Shirt.jpg',
    name: 'Brown Tartan Plaid Flannel Shirt',
    category: 'tops',
    subCategory: 'shirt',
    brand: 'HERE&NOW',
    style: 'casual',
    fabric: 'cotton flannel',
    patterns: ['tartan plaid'],
    season: ['fall', 'winter'],
    occasion: ['casual', 'everyday', 'outdoor'],
    tags: ['tartan', 'plaid', 'flannel', 'check', 'brown', 'white', 'long sleeve', 'slim fit'],
    colors: [
      { hex: '#F5F0E8', rgb: { r: 245, g: 240, b: 232 }, percentage: 45 },
      { hex: '#6B4A2A', rgb: { r: 107, g: 74, b: 42 }, percentage: 35 },
      { hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26 }, percentage: 20 }
    ],
    identity: { type: 'shirt', category: 'tops', subCategory: 'flannel shirt', gender_lean: 'male' },
    color: {
      primary: { name: 'off-white', family: 'neutral', hex: '#F5F0E8', undertone: 'warm', finish: 'matte', brightness: 'light' },
      secondary: { name: 'brown', family: 'brown', hex: '#6B4A2A', coverage_percent: 35 },
      tertiary: { name: 'black', family: 'neutral', hex: '#1A1A1A' },
      isMulticolor: true, colorTemperature: 'warm', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'tartan plaid', scale: 'large', direction: 'allover', density: 'medium', isPatternBusy: true, patternContrast: 'high' },
    fit: { silhouette: 'regular', fit_type: 'slim', waist_definition: 'slight', taper: 'slight', bodyHug: 'semi-fitted' },
    construction: { fabric: 'cotton flannel', fabricWeight: 'medium-heavy', stretch: 'none', transparency: 'opaque', texture: 'brushed', lining: false, sheen: 'matte' },
    dimensions: { length: 'regular', sleeve: 'long', neckline: 'spread collar', hemType: 'curved', cuffs: 'button cuffs' },
    styling: { style: 'casual', formalityScore: 3, aesthetic: ['classic', 'vintage', 'heritage', 'outdoorsy'], trend: ['plaid renaissance', 'grunge revival'], occasion: ['casual', 'everyday', 'outdoor'], season: ['fall', 'winter'], layerable: true, layerPosition: 'mid' },
    matching: {
      matchTags: ['plaid', 'tartan', 'brown', 'white', 'flannel'],
      pairsWellWith: { bottoms: ['dark jeans', 'black jeans', 'chinos', 'brown pants'], outerwear: ['puffer jacket', 'brown leather jacket'], footwear: ['boots', 'work boots', 'loafers'], avoid: ['other busy patterns'] },
      colorHarmony: { complementary: ['navy', 'dark brown', 'black', 'cream'], clashes: ['other plaids', 'florals'], neutral_safe: true },
      versatilityScore: 7, outfitRole: 'statement'
    },
    confidence: { overall: 0.94, color: 0.92, fabric: 0.9, fit: 0.87, pattern: 0.96, needsUserReview: [] }
  },
  {
    filename: 'Herren Cordhemd mit Knopfleiste und Brusttasche.jpg',
    name: 'Blue-Gray Corduroy Shirt',
    category: 'tops',
    subCategory: 'shirt',
    style: 'casual',
    fabric: 'corduroy',
    patterns: ['solid'],
    season: ['fall', 'winter'],
    occasion: ['casual', 'everyday', 'smart casual'],
    tags: ['corduroy', 'blue-gray', 'slate', 'chest pocket', 'long sleeve', 'button-down', 'minimalist'],
    colors: [
      { hex: '#6B8FA8', rgb: { r: 107, g: 143, b: 168 }, percentage: 94 }
    ],
    identity: { type: 'shirt', category: 'tops', subCategory: 'casual shirt', gender_lean: 'male' },
    color: {
      primary: { name: 'slate blue', family: 'blue', hex: '#6B8FA8', undertone: 'cool', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'cool', dominantFamily: 'blue', neutralCompatible: true
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'regular', fit_type: 'relaxed', waist_definition: 'none', taper: 'straight', bodyHug: 'relaxed' },
    construction: { fabric: 'corduroy', fabricWeight: 'medium', stretch: 'low', transparency: 'opaque', texture: 'ridged', lining: false, sheen: 'slight' },
    dimensions: { length: 'regular', sleeve: 'long', neckline: 'point collar', hemType: 'curved', cuffs: 'button cuffs' },
    styling: { style: 'casual', formalityScore: 4, aesthetic: ['minimal', 'clean', 'classic'], trend: ['corduroy revival', 'tonal dressing'], occasion: ['casual', 'everyday', 'smart casual'], season: ['fall', 'winter'], layerable: true, layerPosition: 'mid' },
    matching: {
      matchTags: ['slate blue', 'corduroy', 'relaxed', 'minimal'],
      pairsWellWith: { bottoms: ['navy chinos', 'dark jeans', 'black pants', 'gray trousers'], outerwear: ['navy peacoat', 'camel coat', 'denim jacket'], footwear: ['loafers', 'chelsea boots', 'white sneakers'], avoid: ['busy patterns', 'neon colors'] },
      colorHarmony: { complementary: ['navy', 'white', 'camel', 'cream', 'rust'], clashes: ['bright green', 'yellow'], neutral_safe: true },
      versatilityScore: 8, outfitRole: 'foundation'
    },
    confidence: { overall: 0.94, color: 0.96, fabric: 0.93, fit: 0.88, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 'matthew-moloney-YeGao3uk8kI-unsplash.jpg',
    name: 'Dark Navy Raw Denim Jeans',
    category: 'bottoms',
    subCategory: 'jeans',
    brand: 'Acne Studios',
    style: 'minimalist',
    fabric: 'denim',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall', 'winter'],
    occasion: ['casual', 'smart casual', 'everyday'],
    tags: ['dark denim', 'navy', 'raw denim', 'Acne Studios', 'straight', 'minimalist'],
    colors: [
      { hex: '#1A2338', rgb: { r: 26, g: 35, b: 56 }, percentage: 92 }
    ],
    identity: { type: 'jeans', category: 'bottoms', subCategory: 'straight jeans', gender_lean: 'unisex' },
    color: {
      primary: { name: 'dark navy', family: 'blue', hex: '#1A2338', undertone: 'cool', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'cool', dominantFamily: 'blue', neutralCompatible: true
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'straight', fit_type: 'regular', waist_definition: 'mid-rise', taper: 'straight', bodyHug: 'regular' },
    construction: { fabric: 'denim', fabricWeight: 'heavy', stretch: 'none', transparency: 'opaque', texture: 'raw denim', lining: false, sheen: 'matte' },
    dimensions: { length: 'full', sleeve: 'none', neckline: 'none', hemType: 'straight', cuffs: 'open' },
    styling: { style: 'minimalist', formalityScore: 4, aesthetic: ['minimalist', 'Scandinavian', 'clean'], trend: ['raw denim', 'dark wash'], occasion: ['casual', 'smart casual', 'everyday'], season: ['spring', 'summer', 'fall', 'winter'], layerable: false, layerPosition: 'bottom' },
    matching: {
      matchTags: ['dark navy', 'denim', 'versatile', 'minimalist'],
      pairsWellWith: { bottoms: [], outerwear: ['white tee', 'black turtleneck', 'grey knit', 'button-down shirt', 'blazer'], footwear: ['white sneakers', 'boots', 'loafers', 'derby shoes'], avoid: ['denim jacket (same wash)'] },
      colorHarmony: { complementary: ['white', 'grey', 'black', 'cream', 'camel'], clashes: ['royal blue', 'bright blue'], neutral_safe: true },
      versatilityScore: 10, outfitRole: 'foundation'
    },
    confidence: { overall: 0.97, color: 0.97, fabric: 0.95, fit: 0.9, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: "Men's High Waist Pleated Trousers_ Italian Style Brown Dress Pants Tailored Gurkha Pants.jpg",
    name: 'Brown Italian Gurkha Trousers',
    category: 'bottoms',
    subCategory: 'dress trousers',
    style: 'formal',
    fabric: 'wool blend',
    patterns: ['solid'],
    season: ['fall', 'winter', 'spring'],
    occasion: ['formal', 'smart casual', 'work', 'business'],
    tags: ['gurkha', 'high waist', 'pleated', 'Italian', 'tailored', 'brown', 'formal', 'dress pants'],
    colors: [
      { hex: '#8B5A2B', rgb: { r: 139, g: 90, b: 43 }, percentage: 93 }
    ],
    identity: { type: 'trousers', category: 'bottoms', subCategory: 'dress trousers', gender_lean: 'male' },
    color: {
      primary: { name: 'caramel brown', family: 'brown', hex: '#8B5A2B', undertone: 'warm', finish: 'slight sheen', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'brown', neutralCompatible: false
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'tapered', fit_type: 'tailored', waist_definition: 'high-rise', taper: 'tapered', bodyHug: 'structured' },
    construction: { fabric: 'wool blend', fabricWeight: 'medium', stretch: 'low', transparency: 'opaque', texture: 'smooth', lining: false, sheen: 'subtle' },
    dimensions: { length: 'full with cuffs', sleeve: 'none', neckline: 'none', hemType: 'turn-up cuff', cuffs: 'turn-up' },
    styling: { style: 'formal', formalityScore: 8, aesthetic: ['Italian', 'tailored', 'classic menswear', 'dandyism'], trend: ['gurkha trousers', 'high-waist revival'], occasion: ['formal', 'smart casual', 'work', 'business'], season: ['fall', 'winter', 'spring'], layerable: false, layerPosition: 'bottom' },
    matching: {
      matchTags: ['brown', 'formal', 'tailored', 'Italian', 'high-waist'],
      pairsWellWith: { bottoms: [], outerwear: ['white dress shirt', 'cream turtleneck', 'navy blazer', 'brown suit jacket'], footwear: ['brown loafers', 'tassel loafers', 'oxfords', 'derby shoes'], avoid: ['sneakers', 'casual tees', 'hoodies'] },
      colorHarmony: { complementary: ['white', 'cream', 'navy', 'camel', 'tan'], clashes: ['black (too formal contrast)', 'bright colors'], neutral_safe: false },
      versatilityScore: 6, outfitRole: 'foundation'
    },
    confidence: { overall: 0.95, color: 0.96, fabric: 0.9, fit: 0.93, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 'Minimal Brown Shirt – Clean Casual Style for Men.jpg',
    name: 'Dark Brown Minimal Linen Shirt',
    category: 'tops',
    subCategory: 'shirt',
    style: 'casual',
    fabric: 'linen',
    patterns: ['solid'],
    season: ['fall', 'winter'],
    occasion: ['casual', 'everyday'],
    tags: ['brown', 'linen', 'minimal', 'dark', 'long sleeve', 'button-down', 'clean'],
    colors: [
      { hex: '#3B1A0A', rgb: { r: 59, g: 26, b: 10 }, percentage: 96 }
    ],
    identity: { type: 'shirt', category: 'tops', subCategory: 'casual shirt', gender_lean: 'male' },
    color: {
      primary: { name: 'dark chocolate brown', family: 'brown', hex: '#3B1A0A', undertone: 'warm', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'brown', neutralCompatible: false
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'regular', fit_type: 'regular', waist_definition: 'none', taper: 'straight', bodyHug: 'relaxed' },
    construction: { fabric: 'linen', fabricWeight: 'medium', stretch: 'none', transparency: 'semi-opaque', texture: 'slightly textured', lining: false, sheen: 'matte' },
    dimensions: { length: 'regular', sleeve: 'long rolled', neckline: 'point collar', hemType: 'curved', cuffs: 'button cuffs' },
    styling: { style: 'casual', formalityScore: 3, aesthetic: ['minimal', 'earthy', 'relaxed'], trend: ['dark neutrals', 'minimal menswear'], occasion: ['casual', 'everyday'], season: ['fall', 'winter'], layerable: true, layerPosition: 'base' },
    matching: {
      matchTags: ['dark brown', 'minimal', 'earthy', 'relaxed'],
      pairsWellWith: { bottoms: ['beige chinos', 'cream trousers', 'khaki pants', 'tan pants'], outerwear: ['camel coat', 'dark brown jacket'], footwear: ['white sneakers', 'loafers', 'boots', 'suede shoes'], avoid: ['black (too much contrast)', 'busy patterns'] },
      colorHarmony: { complementary: ['cream', 'beige', 'tan', 'camel', 'rust'], clashes: ['navy', 'black (harsh)'], neutral_safe: false },
      versatilityScore: 6, outfitRole: 'statement'
    },
    confidence: { overall: 0.93, color: 0.97, fabric: 0.88, fit: 0.86, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 't shirt.jpg',
    name: 'Beige Utility Overshirt',
    category: 'tops',
    subCategory: 'overshirt',
    style: 'casual',
    fabric: 'cotton twill',
    patterns: ['solid'],
    season: ['spring', 'fall'],
    occasion: ['casual', 'everyday', 'outdoor', 'workwear'],
    tags: ['overshirt', 'beige', 'khaki', 'utility', 'dual pockets', 'workwear', 'long sleeve'],
    colors: [
      { hex: '#C4B99A', rgb: { r: 196, g: 185, b: 154 }, percentage: 93 }
    ],
    identity: { type: 'overshirt', category: 'tops', subCategory: 'shirt jacket', gender_lean: 'male' },
    color: {
      primary: { name: 'beige khaki', family: 'neutral', hex: '#C4B99A', undertone: 'warm', finish: 'matte', brightness: 'light-medium' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'relaxed', fit_type: 'relaxed', waist_definition: 'none', taper: 'straight', bodyHug: 'loose' },
    construction: { fabric: 'cotton twill', fabricWeight: 'medium-heavy', stretch: 'none', transparency: 'opaque', texture: 'smooth', lining: false, sheen: 'matte' },
    dimensions: { length: 'hip', sleeve: 'long', neckline: 'point collar', hemType: 'straight', cuffs: 'button cuffs' },
    styling: { style: 'casual', formalityScore: 3, aesthetic: ['workwear', 'utility', 'relaxed minimalism'], trend: ['overshirt trend', 'utility style'], occasion: ['casual', 'everyday', 'outdoor', 'workwear'], season: ['spring', 'fall'], layerable: true, layerPosition: 'mid' },
    matching: {
      matchTags: ['beige', 'khaki', 'utility', 'overshirt', 'versatile'],
      pairsWellWith: { bottoms: ['dark jeans', 'olive pants', 'black chinos', 'cargo pants'], outerwear: ['puffer jacket over it', 'worn open over tee'], footwear: ['white sneakers', 'boots', 'loafers'], avoid: ['formal trousers', 'dress shoes'] },
      colorHarmony: { complementary: ['black', 'white', 'navy', 'olive', 'rust'], clashes: ['pastel colors'], neutral_safe: true },
      versatilityScore: 9, outfitRole: 'mid-layer'
    },
    confidence: { overall: 0.93, color: 0.95, fabric: 0.88, fit: 0.87, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: 'U turn blue shirt.jpg',
    name: 'Light Blue Striped Cotton Shirt',
    category: 'tops',
    subCategory: 'shirt',
    style: 'smart casual',
    fabric: 'cotton',
    patterns: ['vertical stripes'],
    season: ['spring', 'summer'],
    occasion: ['casual', 'smart casual', 'work', 'everyday'],
    tags: ['blue', 'stripes', 'light blue', 'smart casual', 'long sleeve', 'chest pocket', 'fresh'],
    colors: [
      { hex: '#87CEEB', rgb: { r: 135, g: 206, b: 235 }, percentage: 75 },
      { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, percentage: 25 }
    ],
    identity: { type: 'shirt', category: 'tops', subCategory: 'casual shirt', gender_lean: 'male' },
    color: {
      primary: { name: 'sky blue', family: 'blue', hex: '#87CEEB', undertone: 'cool', finish: 'matte', brightness: 'light' },
      secondary: { name: 'white', family: 'neutral', hex: '#FFFFFF', coverage_percent: 25 },
      isMulticolor: true, colorTemperature: 'cool', dominantFamily: 'blue', neutralCompatible: true
    },
    pattern: { type: 'stripes', scale: 'fine', direction: 'vertical', density: 'medium', isPatternBusy: false, patternContrast: 'medium' },
    fit: { silhouette: 'regular', fit_type: 'regular', waist_definition: 'none', taper: 'straight', bodyHug: 'relaxed' },
    construction: { fabric: 'cotton', fabricWeight: 'light-medium', stretch: 'none', transparency: 'semi-opaque', texture: 'smooth', lining: false, sheen: 'matte' },
    dimensions: { length: 'regular', sleeve: 'long rolled', neckline: 'point collar', hemType: 'curved', cuffs: 'button cuffs' },
    styling: { style: 'smart casual', formalityScore: 5, aesthetic: ['preppy', 'fresh', 'classic'], trend: ['striped shirt', 'Korean casual'], occasion: ['casual', 'smart casual', 'work', 'everyday'], season: ['spring', 'summer'], layerable: false, layerPosition: 'base' },
    matching: {
      matchTags: ['blue', 'stripes', 'smart casual', 'fresh', 'versatile'],
      pairsWellWith: { bottoms: ['white chinos', 'navy trousers', 'light beige pants', 'dark jeans'], outerwear: ['navy blazer', 'white cardigan'], footwear: ['white sneakers', 'loafers', 'boat shoes', 'oxford shoes'], avoid: ['heavy patterns', 'plaid'] },
      colorHarmony: { complementary: ['white', 'navy', 'beige', 'tan', 'cream'], clashes: ['other busy patterns', 'neon'], neutral_safe: true },
      versatilityScore: 9, outfitRole: 'foundation'
    },
    confidence: { overall: 0.96, color: 0.97, fabric: 0.91, fit: 0.88, pattern: 0.96, needsUserReview: [] }
  },
  {
    filename: "Women's & Men's Clothing, Shop Online Fashion.jpg",
    name: 'Stone Wide-Leg Cargo Pants',
    category: 'bottoms',
    subCategory: 'cargo pants',
    style: 'casual',
    fabric: 'cotton',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['casual', 'everyday', 'outdoor', 'streetwear'],
    tags: ['cargo', 'wide-leg', 'stone', 'beige', 'utility pockets', 'relaxed', 'streetwear'],
    colors: [
      { hex: '#C8C0A8', rgb: { r: 200, g: 192, b: 168 }, percentage: 94 }
    ],
    identity: { type: 'cargo pants', category: 'bottoms', subCategory: 'cargo pants', gender_lean: 'unisex' },
    color: {
      primary: { name: 'stone', family: 'neutral', hex: '#C8C0A8', undertone: 'warm', finish: 'matte', brightness: 'light' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', isPatternBusy: false, patternContrast: 'none' },
    fit: { silhouette: 'wide', fit_type: 'relaxed', waist_definition: 'mid-rise', taper: 'straight', bodyHug: 'loose' },
    construction: { fabric: 'cotton', fabricWeight: 'medium', stretch: 'none', transparency: 'opaque', texture: 'smooth', lining: false, sheen: 'matte' },
    dimensions: { length: 'full', sleeve: 'none', neckline: 'none', hemType: 'straight', cuffs: 'open' },
    styling: { style: 'casual', formalityScore: 2, aesthetic: ['utility', 'streetwear', 'minimalist'], trend: ['cargo pants', 'wide-leg', 'gorpcore'], occasion: ['casual', 'everyday', 'outdoor', 'streetwear'], season: ['spring', 'summer', 'fall'], layerable: false, layerPosition: 'bottom' },
    matching: {
      matchTags: ['stone', 'cargo', 'neutral', 'wide-leg', 'versatile'],
      pairsWellWith: { bottoms: [], outerwear: ['black tee', 'white tee', 'brown shirt', 'graphic tee', 'hoodie'], footwear: ['chunky sneakers', 'sandals', 'boots', 'loafers'], avoid: ['formal shirts', 'dress shoes'] },
      colorHarmony: { complementary: ['black', 'white', 'brown', 'olive', 'rust'], clashes: ['neon'], neutral_safe: true },
      versatilityScore: 9, outfitRole: 'foundation'
    },
    confidence: { overall: 0.93, color: 0.95, fabric: 0.88, fit: 0.87, pattern: 0.99, needsUserReview: [] }
  },
  {
    filename: '4597542037501596160.jpg',
    name: 'Light Blue Wide-Leg Distressed Jeans',
    category: 'bottoms',
    subCategory: 'jeans',
    style: 'streetwear',
    fabric: 'denim',
    patterns: ['acid wash'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['casual', 'streetwear', 'everyday'],
    tags: ['wide-leg', 'light blue', 'acid wash', 'distressed', 'baggy', 'streetwear', 'denim'],
    colors: [
      { hex: '#B8D4E8', rgb: { r: 184, g: 212, b: 232 }, percentage: 80 },
      { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, percentage: 20 }
    ],
    identity: { type: 'jeans', category: 'bottoms', subCategory: 'wide-leg jeans', gender_lean: 'male' },
    color: {
      primary: { name: 'light blue', family: 'blue', hex: '#B8D4E8', undertone: 'cool', finish: 'matte', brightness: 'light' },
      secondary: { name: 'white', family: 'neutral', hex: '#FFFFFF', coverage_percent: 20 },
      isMulticolor: true, colorTemperature: 'cool', dominantFamily: 'blue', neutralCompatible: true
    },
    pattern: { type: 'acid wash', scale: 'allover', direction: 'random', density: 'medium', isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'wide', fit_type: 'baggy', waist_definition: 'mid-rise', taper: 'straight', bodyHug: 'loose' },
    construction: { fabric: 'denim', fabricWeight: 'medium', stretch: 'none', transparency: 'opaque', texture: 'washed denim', lining: false, sheen: 'matte' },
    dimensions: { length: 'full', sleeve: 'none', neckline: 'none', hemType: 'raw/straight', cuffs: 'open' },
    styling: { style: 'streetwear', formalityScore: 1, aesthetic: ['streetwear', '90s', 'skate', 'grunge-lite'], trend: ['baggy denim', 'wide-leg jeans', 'light wash'], occasion: ['casual', 'streetwear', 'everyday'], season: ['spring', 'summer', 'fall'], layerable: false, layerPosition: 'bottom' },
    matching: {
      matchTags: ['light blue', 'wide-leg', 'baggy', 'streetwear', 'denim'],
      pairsWellWith: { bottoms: [], outerwear: ['white tee', 'graphic tee', 'black hoodie', 'brown shirt', 'oversized jacket'], footwear: ['chunky sneakers', 'Jordan 1s', 'Vans', 'skate shoes'], avoid: ['formal tops', 'dress shirts', 'blazers'] },
      colorHarmony: { complementary: ['white', 'black', 'grey', 'brown', 'cream'], clashes: ['navy (too similar)', 'other busy patterns'], neutral_safe: true },
      versatilityScore: 6, outfitRole: 'statement'
    },
    confidence: { overall: 0.92, color: 0.93, fabric: 0.9, fit: 0.88, pattern: 0.9, needsUserReview: [] }
  }
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const user = await User.findOne({ email: USER_EMAIL });
  if (!user) {
    console.error(`User not found: ${USER_EMAIL}`);
    process.exit(1);
  }
  console.log(`Found user: ${user._id}`);

  let added = 0, skipped = 0;

  for (const item of CLOTHING_DATA) {
    const filePath = path.join(PHOTOS_DIR, item.filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`  SKIP (file not found): ${item.filename}`);
      skipped++;
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(item.filename).slice(1).toLowerCase();
    const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const {
      filename, name, category, subCategory, style, fabric, patterns,
      season, occasion, tags, colors, brand,
      identity, color, pattern: patternData, fit, construction,
      dimensions, styling, matching, confidence
    } = item;

    const doc = new Item({
      user: user._id,
      name,
      category,
      subCategory: subCategory || null,
      style: style || null,
      fabric: fabric || null,
      patterns: patterns || [],
      season: season || [],
      occasion: occasion || [],
      tags: tags || [],
      brand: brand || null,
      colors: colors || [],
      imageBase64: base64,
      imageUrl: base64,
      images: [{ url: base64, isPrimary: true }],
      aiAnalyzed: true,
      identity,
      color,
      pattern: patternData,
      fit,
      construction,
      dimensions,
      styling,
      matching,
      confidence,
      aiFeatures: {
        colorAnalysis: {
          warm: (color?.colorTemperature === 'warm') ? 0.9 : (color?.colorTemperature === 'cool') ? 0.1 : 0.5,
          cool: (color?.colorTemperature === 'cool') ? 0.9 : (color?.colorTemperature === 'warm') ? 0.1 : 0.5,
          neutral: (color?.colorTemperature === 'neutral') ? 1 : 0.2
        },
        compatibilityScore: 80,
        trendingScore: 70,
        versatilityScore: matching?.versatilityScore ? matching.versatilityScore * 10 : 75
      }
    });

    await doc.save();
    console.log(`  ADDED: ${name}`);
    added++;
  }

  await User.findByIdAndUpdate(user._id, { $inc: { 'wardrobeStats.totalItems': added } });

  console.log(`\nDone. Added: ${added}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
