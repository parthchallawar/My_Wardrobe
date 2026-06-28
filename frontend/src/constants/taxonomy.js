/**
 * Single source of truth for all dropdown/filter vocabulary shared
 * between AddItemModal, EditItemModal, ShopMatch, CreateOutfitModal, Settings.
 * Must stay in sync with backend/utils/categoryNormalizer.js canonical values.
 */

export const CATEGORIES = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'traditional', label: 'Traditional / Ethnic' },
  { value: 'sarees', label: 'Sarees' },
  { value: 'lehenga', label: 'Lehenga' },
  { value: 'kurta', label: 'Kurta / Kurti' },
];

export const STYLES = [
  'casual', 'formal', 'sporty', 'bohemian',
  'minimalist', 'vintage', 'streetwear', 'glam', 'traditional',
];

export const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'all-season', label: 'All Seasons' },
];

export const OCCASIONS = [
  'everyday', 'work', 'party', 'formal', 'casual', 'sport', 'date', 'travel',
];

export const COLORS = [
  'black', 'white', 'gray', 'navy', 'beige', 'brown',
  'red', 'blue', 'green', 'yellow', 'pink', 'purple',
  'orange', 'burgundy', 'emerald', 'teal', 'khaki', 'olive',
];

/** Maps item.category → outfit item type (used by CreateOutfitModal & outfits route) */
export const CATEGORY_TO_TYPE = {
  tops: 'top',
  bottoms: 'bottom',
  shoes: 'shoes',
  accessories: 'accessory',
  outerwear: 'layer',
  dresses: 'dress',
  traditional: 'top',
  kurta: 'top',
  sarees: 'dress',
  lehenga: 'dress',
};
