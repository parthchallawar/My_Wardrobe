/**
 * Seed script — inserts 12 clothing items directly into MongoDB for the logged-in user.
 * Usage: node backend/scripts/seedItems.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');

const USER_EMAIL = process.env.SEED_USER_EMAIL || 'tastefy.prenan@gmail.com';

const BASE = 'https://images.unsplash.com/photo-';
const Q = '?w=600&h=750&fit=crop&q=80';

const UNSPLASH_IMAGES = {
  'White Oxford Shirt':      BASE + '1596755094514-f87e34085b2c' + Q,
  'Navy Blue Slim Jeans':    BASE + '1542272604-787c3835535d'    + Q,
  'Black Slim Blazer':       BASE + '1507003211169-0a1dd7228f2d' + Q,
  'Heather Grey Sweatshirt': BASE + '1556821840-3a63f15732ce'    + Q,
  'Khaki Slim Chinos':       BASE + '1473966968600-fa801b869a1a' + Q,
  'White Leather Sneakers':  BASE + '1542291026-7eec264c27ff'    + Q,
  'Black Chelsea Boots':     BASE + '1606107557195-0e29a4b5b4aa' + Q,
  'Olive Bomber Jacket':     BASE + '1551537482-f2075a1d41f2'    + Q,
  'Burgundy Polo Shirt':     BASE + '1586363104862-3a5e2ab60d99' + Q,
  'Charcoal Slim Trousers':  BASE + '1594938298603-e8d9a74756e3' + Q,
  'Camel Trench Coat':       BASE + '1539533018257-39c58c6a27b8' + Q,
  'Light Blue Denim Jacket': BASE + '1523205771623-e0faa4d2813d' + Q,
};

const ITEMS = [
  {
    name: 'White Oxford Shirt',
    category: 'tops',
    style: 'formal',
    brand: 'Uniqlo',
    fabric: 'cotton',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['work', 'formal', 'smart-casual'],
    tags: ['button-down', 'oxford', 'classic', 'versatile'],
    colors: [{ hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, percentage: 90 }],
    identity: { type: 'oxford shirt', category: 'tops', subCategory: 'shirts', gender_lean: 'unisex' },
    color: {
      primary: { name: 'white', family: 'neutral', hex: '#FFFFFF', undertone: 'cool', finish: 'matte', brightness: 'light' },
      isMulticolor: false, colorTemperature: 'cool', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'straight', fit_type: 'regular', waist_definition: 'none', bodyHug: 'relaxed' },
    construction: { fabric: 'cotton', fabricWeight: 'medium', stretch: 'none', transparency: 'opaque', texture: 'smooth', sheen: 'matte' },
    dimensions: { length: 'hip', sleeve: 'long', neckline: 'collared', hemType: 'curved' },
    styling: { style: 'formal', formalityScore: 75, aesthetic: ['classic', 'preppy'], trend: ['timeless'], occasion: ['work', 'formal'], season: ['spring', 'summer', 'fall'], layerable: true, layerPosition: 'base' },
    matching: {
      matchTags: ['neutral-base', 'formal-ready', 'layer-friendly'],
      pairsWellWith: { bottoms: ['chinos', 'trousers', 'jeans'], outerwear: ['blazer', 'suit jacket'], footwear: ['loafers', 'oxford shoes', 'sneakers'], avoid: ['athletic shorts'] },
      colorHarmony: { complementary: ['navy', 'black', 'grey', 'camel'], clashes: [], neutral_safe: true },
      versatilityScore: 95, outfitRole: 'base'
    },
    confidence: { overall: 95, color: 98, fabric: 92, fit: 90, pattern: 99 }
  },
  {
    name: 'Navy Blue Slim Jeans',
    category: 'bottoms',
    style: 'casual',
    brand: "Levi's",
    fabric: 'denim',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall', 'winter'],
    occasion: ['casual', 'everyday', 'smart-casual'],
    tags: ['denim', 'slim', 'everyday', 'versatile'],
    colors: [{ hex: '#1B2A4A', rgb: { r: 27, g: 42, b: 74 }, percentage: 95 }],
    identity: { type: 'slim jeans', category: 'bottoms', subCategory: 'jeans', gender_lean: 'unisex' },
    color: {
      primary: { name: 'navy blue', family: 'blue', hex: '#1B2A4A', undertone: 'cool', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'cool', dominantFamily: 'blue', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'tapered', fit_type: 'slim', waist_definition: 'mid-rise', bodyHug: 'fitted' },
    construction: { fabric: 'denim', fabricWeight: 'heavy', stretch: 'slight', transparency: 'opaque', texture: 'twill', sheen: 'matte' },
    dimensions: { length: 'full', hemType: 'straight' },
    styling: { style: 'casual', formalityScore: 40, aesthetic: ['classic', 'minimalist'], trend: ['timeless'], occasion: ['casual', 'everyday'], season: ['all'], layerable: false },
    matching: {
      matchTags: ['wardrobe-staple', 'neutral-bottom', 'easy-pair'],
      pairsWellWith: { bottoms: [], outerwear: ['denim jacket', 'bomber', 'trench'], footwear: ['sneakers', 'boots', 'loafers'], avoid: ['athletic shoes'] },
      colorHarmony: { complementary: ['white', 'grey', 'beige', 'camel', 'burgundy'], clashes: ['navy tops'], neutral_safe: true },
      versatilityScore: 90, outfitRole: 'base'
    },
    confidence: { overall: 94, color: 97, fabric: 95, fit: 92, pattern: 99 }
  },
  {
    name: 'Black Slim Blazer',
    category: 'outerwear',
    style: 'formal',
    brand: 'Zara',
    fabric: 'polyester blend',
    patterns: ['solid'],
    season: ['fall', 'winter', 'spring'],
    occasion: ['formal', 'work', 'evening'],
    tags: ['blazer', 'formal', 'smart', 'layer'],
    colors: [{ hex: '#1C1C1C', rgb: { r: 28, g: 28, b: 28 }, percentage: 98 }],
    identity: { type: 'blazer', category: 'outerwear', subCategory: 'jackets', gender_lean: 'unisex' },
    color: {
      primary: { name: 'black', family: 'neutral', hex: '#1C1C1C', undertone: 'neutral', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'neutral', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'structured', fit_type: 'slim', waist_definition: 'defined', bodyHug: 'tailored' },
    construction: { fabric: 'polyester blend', fabricWeight: 'medium', stretch: 'none', transparency: 'opaque', texture: 'smooth', lining: true, sheen: 'slight' },
    dimensions: { length: 'hip', sleeve: 'long', neckline: 'lapel', hemType: 'straight' },
    styling: { style: 'formal', formalityScore: 85, aesthetic: ['classic', 'minimalist', 'sophisticated'], trend: ['timeless'], occasion: ['formal', 'work', 'evening'], season: ['fall', 'winter', 'spring'], layerable: true, layerPosition: 'outer' },
    matching: {
      matchTags: ['statement-layer', 'formal-anchor', 'elevates-casual'],
      pairsWellWith: { bottoms: ['trousers', 'chinos', 'jeans'], outerwear: ['trench coat'], footwear: ['oxford shoes', 'loafers', 'chelsea boots'], avoid: ['athletic wear'] },
      colorHarmony: { complementary: ['white', 'grey', 'navy', 'burgundy', 'beige'], clashes: [], neutral_safe: true },
      versatilityScore: 88, outfitRole: 'statement'
    },
    confidence: { overall: 96, color: 99, fabric: 88, fit: 94, pattern: 99 }
  },
  {
    name: 'Heather Grey Sweatshirt',
    category: 'tops',
    style: 'casual',
    brand: 'H&M',
    fabric: 'cotton fleece',
    patterns: ['solid'],
    season: ['fall', 'winter'],
    occasion: ['casual', 'everyday', 'loungewear'],
    tags: ['crew-neck', 'cozy', 'basics', 'athleisure'],
    colors: [{ hex: '#9E9E9E', rgb: { r: 158, g: 158, b: 158 }, percentage: 95 }],
    identity: { type: 'crew neck sweatshirt', category: 'tops', subCategory: 'sweatshirts', gender_lean: 'unisex' },
    color: {
      primary: { name: 'heather grey', family: 'neutral', hex: '#9E9E9E', undertone: 'neutral', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'neutral', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'boxy', fit_type: 'relaxed', waist_definition: 'none', bodyHug: 'loose' },
    construction: { fabric: 'cotton fleece', fabricWeight: 'heavy', stretch: 'moderate', transparency: 'opaque', texture: 'soft', sheen: 'matte' },
    dimensions: { length: 'hip', sleeve: 'long', neckline: 'crew', hemType: 'ribbed' },
    styling: { style: 'casual', formalityScore: 20, aesthetic: ['minimal', 'streetwear', 'athleisure'], trend: ['normcore'], occasion: ['casual', 'everyday'], season: ['fall', 'winter'], layerable: true, layerPosition: 'mid' },
    matching: {
      matchTags: ['neutral-top', 'casual-go-to', 'layer-friendly'],
      pairsWellWith: { bottoms: ['jeans', 'joggers', 'sweatpants', 'chinos'], outerwear: ['bomber', 'denim jacket', 'trench'], footwear: ['sneakers', 'slides'], avoid: ['formal trousers', 'dress shoes'] },
      colorHarmony: { complementary: ['black', 'navy', 'white', 'olive', 'camel'], clashes: [], neutral_safe: true },
      versatilityScore: 85, outfitRole: 'base'
    },
    confidence: { overall: 93, color: 96, fabric: 94, fit: 91, pattern: 99 }
  },
  {
    name: 'Khaki Slim Chinos',
    category: 'bottoms',
    style: 'smart-casual',
    brand: 'Gap',
    fabric: 'cotton twill',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['smart-casual', 'work', 'weekend'],
    tags: ['chinos', 'smart-casual', 'versatile', 'classic'],
    colors: [{ hex: '#C3A882', rgb: { r: 195, g: 168, b: 130 }, percentage: 95 }],
    identity: { type: 'chinos', category: 'bottoms', subCategory: 'pants', gender_lean: 'unisex' },
    color: {
      primary: { name: 'khaki', family: 'beige', hex: '#C3A882', undertone: 'warm', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'beige', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false, patternContrast: 'low' },
    fit: { silhouette: 'tapered', fit_type: 'slim', waist_definition: 'mid-rise', bodyHug: 'fitted' },
    construction: { fabric: 'cotton twill', fabricWeight: 'medium', stretch: 'slight', transparency: 'opaque', texture: 'smooth', sheen: 'matte' },
    dimensions: { length: 'full', hemType: 'straight' },
    styling: { style: 'smart-casual', formalityScore: 55, aesthetic: ['preppy', 'classic', 'minimalist'], trend: ['timeless'], occasion: ['smart-casual', 'work', 'weekend'], season: ['spring', 'summer', 'fall'], layerable: false },
    matching: {
      matchTags: ['neutral-bottom', 'smart-casual-staple', 'warm-neutral'],
      pairsWellWith: { bottoms: [], outerwear: ['blazer', 'bomber', 'trench'], footwear: ['loafers', 'sneakers', 'boots'], avoid: ['athletic sneakers'] },
      colorHarmony: { complementary: ['white', 'navy', 'olive', 'burgundy', 'black'], clashes: [], neutral_safe: true },
      versatilityScore: 88, outfitRole: 'base'
    },
    confidence: { overall: 94, color: 96, fabric: 93, fit: 92, pattern: 99 }
  },
  {
    name: 'White Leather Sneakers',
    category: 'shoes',
    style: 'casual',
    brand: 'Adidas',
    fabric: 'leather',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['casual', 'everyday', 'smart-casual'],
    tags: ['sneakers', 'white', 'clean', 'versatile'],
    colors: [{ hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, percentage: 85 }],
    identity: { type: 'low-top sneakers', category: 'shoes', subCategory: 'sneakers', gender_lean: 'unisex' },
    color: {
      primary: { name: 'white', family: 'neutral', hex: '#F5F5F5', undertone: 'neutral', finish: 'semi-gloss', brightness: 'light' },
      isMulticolor: false, colorTemperature: 'neutral', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false },
    fit: { fit_type: 'regular' },
    construction: { fabric: 'leather', fabricWeight: 'medium', stretch: 'none', transparency: 'opaque', texture: 'smooth', sheen: 'semi-gloss' },
    styling: { style: 'casual', formalityScore: 30, aesthetic: ['minimalist', 'clean', 'streetwear'], trend: ['classic'], occasion: ['casual', 'smart-casual'], season: ['spring', 'summer', 'fall'], layerable: false },
    matching: {
      matchTags: ['footwear-neutral', 'easy-pair', 'clean-look'],
      pairsWellWith: { bottoms: ['jeans', 'chinos', 'shorts'], outerwear: ['blazer', 'bomber', 'denim jacket'], footwear: [], avoid: ['formal suits'] },
      colorHarmony: { complementary: ['navy', 'grey', 'black', 'olive', 'camel'], clashes: [], neutral_safe: true },
      versatilityScore: 92, outfitRole: 'base'
    },
    confidence: { overall: 95, color: 98, fabric: 90, fit: 93, pattern: 99 }
  },
  {
    name: 'Black Chelsea Boots',
    category: 'shoes',
    style: 'smart-casual',
    brand: 'Dr. Martens',
    fabric: 'leather',
    patterns: ['solid'],
    season: ['fall', 'winter', 'spring'],
    occasion: ['smart-casual', 'work', 'evening'],
    tags: ['chelsea', 'boots', 'leather', 'elevated'],
    colors: [{ hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26 }, percentage: 98 }],
    identity: { type: 'chelsea boots', category: 'shoes', subCategory: 'boots', gender_lean: 'unisex' },
    color: {
      primary: { name: 'black', family: 'neutral', hex: '#1A1A1A', undertone: 'neutral', finish: 'gloss', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'neutral', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false },
    fit: { fit_type: 'regular' },
    construction: { fabric: 'leather', fabricWeight: 'heavy', stretch: 'slight', transparency: 'opaque', texture: 'smooth', sheen: 'gloss' },
    styling: { style: 'smart-casual', formalityScore: 65, aesthetic: ['classic', 'edgy', 'minimalist'], trend: ['timeless'], occasion: ['smart-casual', 'work', 'evening'], season: ['fall', 'winter', 'spring'], layerable: false },
    matching: {
      matchTags: ['elevated-footwear', 'smart-casual', 'winter-ready'],
      pairsWellWith: { bottoms: ['jeans', 'trousers', 'chinos'], outerwear: ['blazer', 'trench', 'leather jacket'], footwear: [], avoid: ['athletic wear', 'shorts'] },
      colorHarmony: { complementary: ['grey', 'navy', 'white', 'camel', 'burgundy'], clashes: [], neutral_safe: true },
      versatilityScore: 86, outfitRole: 'accent'
    },
    confidence: { overall: 96, color: 98, fabric: 94, fit: 93, pattern: 99 }
  },
  {
    name: 'Olive Bomber Jacket',
    category: 'outerwear',
    style: 'streetwear',
    brand: 'Nike',
    fabric: 'nylon',
    patterns: ['solid'],
    season: ['spring', 'fall'],
    occasion: ['casual', 'streetwear', 'weekend'],
    tags: ['bomber', 'olive', 'street', 'casual-layer'],
    colors: [{ hex: '#556B2F', rgb: { r: 85, g: 107, b: 47 }, percentage: 90 }],
    identity: { type: 'bomber jacket', category: 'outerwear', subCategory: 'jackets', gender_lean: 'unisex' },
    color: {
      primary: { name: 'olive green', family: 'green', hex: '#556B2F', undertone: 'warm', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'green', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false },
    fit: { silhouette: 'boxy', fit_type: 'relaxed', waist_definition: 'none', bodyHug: 'loose' },
    construction: { fabric: 'nylon', fabricWeight: 'light', stretch: 'none', transparency: 'opaque', texture: 'smooth', sheen: 'slight' },
    dimensions: { length: 'waist', sleeve: 'long', hemType: 'ribbed' },
    styling: { style: 'streetwear', formalityScore: 25, aesthetic: ['military', 'streetwear', 'casual'], trend: ['classic'], occasion: ['casual', 'weekend'], season: ['spring', 'fall'], layerable: true, layerPosition: 'outer' },
    matching: {
      matchTags: ['street-layer', 'earth-tone', 'casual-cool'],
      pairsWellWith: { bottoms: ['black jeans', 'joggers', 'navy chinos'], outerwear: [], footwear: ['sneakers', 'combat boots'], avoid: ['formal trousers', 'blazer'] },
      colorHarmony: { complementary: ['black', 'white', 'camel', 'burgundy', 'navy'], clashes: ['bright green', 'red'], neutral_safe: true },
      versatilityScore: 78, outfitRole: 'statement'
    },
    confidence: { overall: 92, color: 94, fabric: 91, fit: 90, pattern: 99 }
  },
  {
    name: 'Burgundy Polo Shirt',
    category: 'tops',
    style: 'smart-casual',
    brand: 'Ralph Lauren',
    fabric: 'pique cotton',
    patterns: ['solid'],
    season: ['spring', 'summer'],
    occasion: ['smart-casual', 'golf', 'casual'],
    tags: ['polo', 'burgundy', 'smart-casual', 'summer'],
    colors: [{ hex: '#722F37', rgb: { r: 114, g: 47, b: 55 }, percentage: 95 }],
    identity: { type: 'polo shirt', category: 'tops', subCategory: 'polos', gender_lean: 'unisex' },
    color: {
      primary: { name: 'burgundy', family: 'red', hex: '#722F37', undertone: 'cool', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'red', neutralCompatible: false
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false, patternContrast: 'medium' },
    fit: { silhouette: 'straight', fit_type: 'regular', waist_definition: 'slight', bodyHug: 'moderate' },
    construction: { fabric: 'pique cotton', fabricWeight: 'medium', stretch: 'slight', transparency: 'opaque', texture: 'textured', sheen: 'matte' },
    dimensions: { length: 'hip', sleeve: 'short', neckline: 'polo', hemType: 'straight' },
    styling: { style: 'smart-casual', formalityScore: 50, aesthetic: ['preppy', 'classic', 'sporty'], trend: ['timeless'], occasion: ['smart-casual', 'casual'], season: ['spring', 'summer'], layerable: true, layerPosition: 'base' },
    matching: {
      matchTags: ['color-accent', 'preppy-top', 'smart-sporty'],
      pairsWellWith: { bottoms: ['chinos', 'jeans', 'shorts'], outerwear: ['blazer', 'bomber'], footwear: ['loafers', 'sneakers'], avoid: ['formal suits'] },
      colorHarmony: { complementary: ['navy', 'khaki', 'white', 'grey'], clashes: ['red', 'orange', 'pink'], neutral_safe: false },
      versatilityScore: 72, outfitRole: 'accent'
    },
    confidence: { overall: 93, color: 96, fabric: 92, fit: 91, pattern: 99 }
  },
  {
    name: 'Charcoal Slim Trousers',
    category: 'bottoms',
    style: 'formal',
    brand: 'M&S',
    fabric: 'wool blend',
    patterns: ['solid'],
    season: ['fall', 'winter', 'spring'],
    occasion: ['formal', 'work', 'business'],
    tags: ['trousers', 'formal', 'charcoal', 'tailored'],
    colors: [{ hex: '#444444', rgb: { r: 68, g: 68, b: 68 }, percentage: 97 }],
    identity: { type: 'dress trousers', category: 'bottoms', subCategory: 'trousers', gender_lean: 'unisex' },
    color: {
      primary: { name: 'charcoal grey', family: 'neutral', hex: '#444444', undertone: 'cool', finish: 'matte', brightness: 'dark' },
      isMulticolor: false, colorTemperature: 'cool', dominantFamily: 'neutral', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false },
    fit: { silhouette: 'straight', fit_type: 'slim', waist_definition: 'high-rise', bodyHug: 'tailored' },
    construction: { fabric: 'wool blend', fabricWeight: 'medium', stretch: 'none', transparency: 'opaque', texture: 'smooth', lining: true, sheen: 'slight' },
    dimensions: { length: 'full', hemType: 'straight' },
    styling: { style: 'formal', formalityScore: 85, aesthetic: ['classic', 'minimalist', 'sophisticated'], trend: ['timeless'], occasion: ['formal', 'work'], season: ['fall', 'winter', 'spring'], layerable: false },
    matching: {
      matchTags: ['formal-bottom', 'neutral-anchor', 'elevated-base'],
      pairsWellWith: { bottoms: [], outerwear: ['blazer', 'trench coat', 'overcoat'], footwear: ['oxford shoes', 'chelsea boots', 'loafers'], avoid: ['sneakers', 'athletic shoes'] },
      colorHarmony: { complementary: ['white', 'light blue', 'navy', 'burgundy'], clashes: [], neutral_safe: true },
      versatilityScore: 82, outfitRole: 'base'
    },
    confidence: { overall: 94, color: 97, fabric: 92, fit: 93, pattern: 99 }
  },
  {
    name: 'Camel Trench Coat',
    category: 'outerwear',
    style: 'formal',
    brand: 'Burberry',
    fabric: 'cotton gabardine',
    patterns: ['solid'],
    season: ['spring', 'fall'],
    occasion: ['formal', 'work', 'smart-casual'],
    tags: ['trench', 'camel', 'classic', 'investment-piece'],
    colors: [{ hex: '#C19A6B', rgb: { r: 193, g: 154, b: 107 }, percentage: 95 }],
    identity: { type: 'trench coat', category: 'outerwear', subCategory: 'coats', gender_lean: 'unisex' },
    color: {
      primary: { name: 'camel', family: 'beige', hex: '#C19A6B', undertone: 'warm', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'warm', dominantFamily: 'beige', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false },
    fit: { silhouette: 'structured', fit_type: 'regular', waist_definition: 'belted', bodyHug: 'relaxed' },
    construction: { fabric: 'cotton gabardine', fabricWeight: 'heavy', stretch: 'none', transparency: 'opaque', texture: 'smooth', lining: true, sheen: 'slight' },
    dimensions: { length: 'knee', sleeve: 'long', hemType: 'straight' },
    styling: { style: 'formal', formalityScore: 78, aesthetic: ['classic', 'sophisticated', 'timeless'], trend: ['heritage'], occasion: ['formal', 'work', 'smart-casual'], season: ['spring', 'fall'], layerable: true, layerPosition: 'outer' },
    matching: {
      matchTags: ['statement-outer', 'classic-investment', 'warm-neutral'],
      pairsWellWith: { bottoms: ['jeans', 'trousers', 'chinos'], outerwear: [], footwear: ['chelsea boots', 'oxford shoes', 'sneakers'], avoid: ['athletic wear'] },
      colorHarmony: { complementary: ['navy', 'black', 'white', 'burgundy', 'grey'], clashes: ['brown', 'tan'], neutral_safe: true },
      versatilityScore: 87, outfitRole: 'statement'
    },
    confidence: { overall: 95, color: 97, fabric: 93, fit: 94, pattern: 99 }
  },
  {
    name: 'Light Blue Denim Jacket',
    category: 'outerwear',
    style: 'casual',
    brand: "Levi's",
    fabric: 'denim',
    patterns: ['solid'],
    season: ['spring', 'summer', 'fall'],
    occasion: ['casual', 'everyday', 'weekend'],
    tags: ['denim', 'jacket', 'light-wash', 'casual'],
    colors: [{ hex: '#7BA4CB', rgb: { r: 123, g: 164, b: 203 }, percentage: 90 }],
    identity: { type: 'denim jacket', category: 'outerwear', subCategory: 'jackets', gender_lean: 'unisex' },
    color: {
      primary: { name: 'light blue', family: 'blue', hex: '#7BA4CB', undertone: 'cool', finish: 'matte', brightness: 'medium' },
      isMulticolor: false, colorTemperature: 'cool', dominantFamily: 'blue', neutralCompatible: true
    },
    pattern: { type: 'solid', scale: null, isPatternBusy: false },
    fit: { silhouette: 'boxy', fit_type: 'regular', waist_definition: 'none', bodyHug: 'relaxed' },
    construction: { fabric: 'denim', fabricWeight: 'heavy', stretch: 'none', transparency: 'opaque', texture: 'twill', sheen: 'matte' },
    dimensions: { length: 'waist', sleeve: 'long', hemType: 'straight' },
    styling: { style: 'casual', formalityScore: 25, aesthetic: ['casual', 'American', 'classic'], trend: ['timeless'], occasion: ['casual', 'everyday', 'weekend'], season: ['spring', 'summer', 'fall'], layerable: true, layerPosition: 'outer' },
    matching: {
      matchTags: ['casual-layer', 'denim-on-denim-risk', 'summer-jacket'],
      pairsWellWith: { bottoms: ['black jeans', 'white jeans', 'chinos', 'shorts'], outerwear: [], footwear: ['sneakers', 'boots', 'espadrilles'], avoid: ['navy jeans'] },
      colorHarmony: { complementary: ['white', 'black', 'grey', 'red', 'yellow'], clashes: ['navy denim', 'indigo jeans'], neutral_safe: true },
      versatilityScore: 80, outfitRole: 'statement'
    },
    confidence: { overall: 93, color: 95, fabric: 96, fit: 91, pattern: 99 }
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wardrobe-ai', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB connected');

  const user = await User.findOne({ email: USER_EMAIL });
  if (!user) {
    console.error(`❌ User not found: ${USER_EMAIL}`);
    console.error('Set SEED_USER_EMAIL env var or register first.');
    process.exit(1);
  }
  console.log(`👤 Seeding for user: ${user.email} (${user._id})`);

  const docs = ITEMS.map(item => {
    const imgUrl = UNSPLASH_IMAGES[item.name] || '';
    return {
      ...item,
      user: user._id,
      aiAnalyzed: true,
      isAvailable: true,
      wearCount: Math.floor(Math.random() * 12),
      imageUrl: imgUrl,
      images: [{ url: imgUrl, isPrimary: true }]
    };
  });

  const inserted = await Item.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} items:`);
  inserted.forEach(i => console.log(`   • ${i.name} (${i.category}) — ${i._id}`));

  await mongoose.disconnect();
  console.log('\n🎉 Done! Reload /wardrobe to see them.');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
