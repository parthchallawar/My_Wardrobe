/**
 * AI Wardrobe Matching Engine
 * Handles color theory, style matching, and outfit generation algorithms
 */

class WardrobeAI {
  // Color harmony rules and relationships - expanded for global clothing coverage
  static colorWheel = {
    red: { complementary: 'green', analogous: ['orange', 'purple'], temperature: 'warm' },
    orange: { complementary: 'blue', analogous: ['red', 'yellow'], temperature: 'warm' },
    yellow: { complementary: 'purple', analogous: ['orange', 'green'], temperature: 'warm' },
    green: { complementary: 'red', analogous: ['yellow', 'teal'], temperature: 'cool' },
    blue: { complementary: 'orange', analogous: ['green', 'purple'], temperature: 'cool' },
    purple: { complementary: 'yellow', analogous: ['blue', 'pink'], temperature: 'cool' },
    pink: { complementary: 'teal', analogous: ['purple', 'red'], temperature: 'cool' },
    brown: { complementary: 'navy', analogous: ['tan', 'rust'], temperature: 'warm' },
    black: { complementary: null, analogous: null, temperature: 'neutral', universal: true },
    white: { complementary: null, analogous: null, temperature: 'neutral', universal: true },
    gray: { complementary: null, analogous: null, temperature: 'neutral', universal: true },
    navy: { complementary: 'orange', analogous: ['blue', 'purple'], temperature: 'cool' },
    beige: { complementary: 'navy', analogous: ['brown', 'cream'], temperature: 'neutral' },
    cream: { complementary: 'navy', analogous: ['beige', 'white'], temperature: 'neutral' },
    khaki: { complementary: 'navy', analogous: ['beige', 'olive'], temperature: 'neutral' },
    olive: { complementary: 'purple', analogous: ['green', 'brown'], temperature: 'neutral' },
    burgundy: { complementary: 'emerald', analogous: ['red', 'purple'], temperature: 'warm' },
    emerald: { complementary: 'burgundy', analogous: ['green', 'teal'], temperature: 'cool' },
    teal: { complementary: 'orange', analogous: ['blue', 'green'], temperature: 'cool' },
    gold: { complementary: 'purple', analogous: ['orange', 'yellow'], temperature: 'warm' },
    silver: { complementary: 'navy', analogous: ['gray', 'white'], temperature: 'neutral' },
    // Extended colors for global/traditional clothing
    violet: { complementary: 'yellow', analogous: ['purple', 'blue'], temperature: 'cool' },
    indigo: { complementary: 'orange', analogous: ['blue', 'purple'], temperature: 'cool' },
    maroon: { complementary: 'emerald', analogous: ['burgundy', 'red'], temperature: 'warm' },
    coral: { complementary: 'teal', analogous: ['orange', 'pink'], temperature: 'warm' },
    lavender: { complementary: 'gold', analogous: ['purple', 'pink'], temperature: 'cool' },
    magenta: { complementary: 'green', analogous: ['purple', 'pink'], temperature: 'cool' },
    turquoise: { complementary: 'burgundy', analogous: ['teal', 'blue'], temperature: 'cool' },
    rust: { complementary: 'navy', analogous: ['brown', 'orange'], temperature: 'warm' },
    tan: { complementary: 'navy', analogous: ['beige', 'brown'], temperature: 'neutral' },
    peach: { complementary: 'navy', analogous: ['coral', 'pink'], temperature: 'warm' },
    mustard: { complementary: 'purple', analogous: ['yellow', 'gold'], temperature: 'warm' }
  };

  // Style compatibility matrix - expanded with 'traditional' style
  static styleCompatibility = {
    casual: { casual: 100, formal: 30, sporty: 70, bohemian: 60, minimalist: 80, vintage: 50, streetwear: 90, glam: 40, traditional: 25 },
    formal: { casual: 30, formal: 100, sporty: 10, bohemian: 20, minimalist: 90, vintage: 40, streetwear: 20, glam: 85, traditional: 75 },
    sporty: { casual: 70, formal: 10, sporty: 100, bohemian: 30, minimalist: 50, vintage: 20, streetwear: 80, glam: 20, traditional: 15 },
    bohemian: { casual: 60, formal: 20, sporty: 30, bohemian: 100, minimalist: 40, vintage: 90, streetwear: 50, glam: 60, traditional: 55 },
    minimalist: { casual: 80, formal: 90, sporty: 50, bohemian: 40, minimalist: 100, vintage: 70, streetwear: 60, glam: 75, traditional: 50 },
    vintage: { casual: 50, formal: 40, sporty: 20, bohemian: 90, minimalist: 70, vintage: 100, streetwear: 40, glam: 65, traditional: 80 },
    streetwear: { casual: 90, formal: 20, sporty: 80, bohemian: 50, minimalist: 60, vintage: 40, streetwear: 100, glam: 30, traditional: 15 },
    glam: { casual: 40, formal: 85, sporty: 20, bohemian: 60, minimalist: 75, vintage: 65, streetwear: 30, glam: 100, traditional: 70 },
    traditional: { casual: 25, formal: 75, sporty: 15, bohemian: 55, minimalist: 50, vintage: 80, streetwear: 15, glam: 70, traditional: 100 }
  };

  // Fashion rules for outfit combinations
  static fashionRules = {
    neutrals: ['black', 'white', 'gray', 'beige', 'cream', 'navy', 'khaki', 'silver'],
    maxColors: 4,
    maxPatterns: 2,
    patternConflictRules: {
      'striped': ['plaid', 'checkered'],
      'plaid': ['striped', 'geometric'],
      'floral': ['geometric', 'animal-print'],
      'geometric': ['floral', 'plaid'],
      'animal-print': ['floral', 'geometric'],
      'polka-dot': ['striped', 'plaid'],
      'checkered': ['striped', 'plaid']
    }
  };

  /**
   * Calculate color harmony score between two or more colors
   */
  static calculateColorHarmony(colors) {
    if (colors.length < 2) return 100;

    let totalScore = 0;
    let comparisons = 0;

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const color1 = this.normalizeColor(colors[i]);
        const color2 = this.normalizeColor(colors[j]);
        const score = this.getColorCompatibilityScore(color1, color2);
        totalScore += score;
        comparisons++;
      }
    }

    // Penalize too many colors beyond the limit
    if (colors.length > this.fashionRules.maxColors) {
      const penalty = (colors.length - this.fashionRules.maxColors) * 15;
      totalScore -= penalty * comparisons;
    }

    return Math.max(0, Math.min(100, totalScore / comparisons));
  }

  /**
   * Get compatibility score between two colors
   */
  static getColorCompatibilityScore(color1, color2) {
    if (!this.colorWheel[color1] || !this.colorWheel[color2]) {
      return 50; // Unknown colors get neutral score
    }

    const info1 = this.colorWheel[color1];
    const info2 = this.colorWheel[color2];

    // Universal colors (neutrals) go with everything
    if (info1.universal || info2.universal) {
      return 100;
    }

    // Complementary colors - highest score
    if (info1.complementary === color2 || info2.complementary === color1) {
      return 95;
    }

    // Analogous colors - good score
    if (info1.analogous?.includes(color2) || info2.analogous?.includes(color1)) {
      return 85;
    }

    // Same temperature - decent score
    if (info1.temperature === info2.temperature) {
      return 70;
    }

    // Different temperatures - lower score but still wearable
    return 45;
  }

  /**
   * Normalize color name to standard format
   */
  static normalizeColor(color) {
    if (!color) return 'gray';
    return color.toLowerCase().trim();
  }

  /**
   * Convert HEX color to RGB
   * @param {string} hex - HEX color code (e.g., #FF5733)
   * @returns {{r: number, g: number, b: number} | null}
   */
  static hexToRgb(hex) {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate distance between two RGB colors
   * @param {{r: number, g: number, b: number}} rgb1
   * @param {{r: number, g: number, b: number}} rgb2
   * @returns {number}
   */
  static colorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  /**
   * Get color information from HEX code
   * Maps HEX to nearest named color in the color wheel
   * @param {string} hex - HEX color code (e.g., #FF5733)
   * @returns {{name: string, temperature: string, complementary?: string, analogous?: string[]} | null}
   */
  static getColorInfoFromHex(hex) {
    if (!hex) return null;

    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    // Named colors with their RGB values for matching - expanded for global coverage
    const namedColors = {
      red: { r: 255, g: 0, b: 0 },
      orange: { r: 255, g: 165, b: 0 },
      yellow: { r: 255, g: 255, b: 0 },
      green: { r: 0, g: 128, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      purple: { r: 128, g: 0, b: 128 },
      pink: { r: 255, g: 192, b: 203 },
      brown: { r: 139, g: 69, b: 19 },
      black: { r: 0, g: 0, b: 0 },
      white: { r: 255, g: 255, b: 255 },
      gray: { r: 128, g: 128, b: 128 },
      navy: { r: 0, g: 0, b: 128 },
      beige: { r: 245, g: 245, b: 220 },
      cream: { r: 255, g: 253, b: 208 },
      khaki: { r: 189, g: 183, b: 107 },
      olive: { r: 128, g: 128, b: 0 },
      burgundy: { r: 128, g: 0, b: 32 },
      emerald: { r: 80, g: 200, b: 120 },
      teal: { r: 0, g: 128, b: 128 },
      gold: { r: 255, g: 215, b: 0 },
      silver: { r: 192, g: 192, b: 192 },
      violet: { r: 122, g: 40, b: 138 },
      indigo: { r: 75, g: 0, b: 130 },
      maroon: { r: 128, g: 0, b: 0 },
      coral: { r: 255, g: 127, b: 80 },
      lavender: { r: 230, g: 230, b: 250 },
      magenta: { r: 255, g: 0, b: 255 },
      turquoise: { r: 64, g: 224, b: 208 },
      rust: { r: 183, g: 65, b: 14 },
      tan: { r: 210, g: 180, b: 140 },
      peach: { r: 255, g: 218, b: 185 },
      mustard: { r: 255, g: 219, b: 88 }
    };

    // Find the closest named color
    let closestColor = 'gray';
    let minDistance = Infinity;

    for (const [name, colorRgb] of Object.entries(namedColors)) {
      const distance = this.colorDistance(rgb, colorRgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    }

    // Get color wheel info for the closest match
    const colorWheelInfo = this.colorWheel[closestColor];

    return {
      name: closestColor,
      temperature: colorWheelInfo?.temperature || 'neutral',
      complementary: colorWheelInfo?.complementary || null,
      analogous: colorWheelInfo?.analogous || null,
      universal: colorWheelInfo?.universal || false
    };
  }

  /**
   * Convenience method: get just the color name from a HEX code
   * Used by ai.js routes to convert legacy color format
   * @param {string} hex - HEX color code
   * @returns {string|null} Color name or null
   */
  static getColorNameFromHex(hex) {
    const info = this.getColorInfoFromHex(hex);
    return info?.name || null;
  }

  /**
   * Calculate style consistency score for an outfit
   */
  static calculateStyleConsistency(styles) {
    if (styles.length < 2) return 100;

    let totalScore = 0;
    let comparisons = 0;

    for (let i = 0; i < styles.length; i++) {
      for (let j = i + 1; j < styles.length; j++) {
        const style1 = styles[i]?.toLowerCase();
        const style2 = styles[j]?.toLowerCase();

        if (this.styleCompatibility[style1] && this.styleCompatibility[style1][style2]) {
          totalScore += this.styleCompatibility[style1][style2];
          comparisons++;
        }
      }
    }

    return comparisons > 0 ? totalScore / comparisons : 50;
  }

  /**
   * Check if patterns conflict with each other
   */
  static checkPatternCompatibility(patterns) {
    if (patterns.length === 0) return 100;

    const solidCount = patterns.filter(p => p === 'solid' || p === 'none').length;

    // If mostly solid items, no issue
    if (solidCount >= patterns.length - 1) return 100;

    // Check for pattern conflicts
    const nonSolidPatterns = patterns.filter(p => p !== 'solid' && p !== 'none');

    if (nonSolidPatterns.length > this.fashionRules.maxPatterns) {
      return 0; // Too many patterns
    }

    for (let i = 0; i < nonSolidPatterns.length; i++) {
      for (let j = i + 1; j < nonSolidPatterns.length; j++) {
        const pattern1 = nonSolidPatterns[i];
        const pattern2 = nonSolidPatterns[j];

        if (this.fashionRules.patternConflictRules[pattern1]?.includes(pattern2) ||
            this.fashionRules.patternConflictRules[pattern2]?.includes(pattern1)) {
          return 0; // Conflicting patterns
        }
      }
    }

    return 70; // Patterns work together but need styling
  }

  /**
   * Calculate seasonality score for an outfit
   */
  static calculateSeasonality(outfitSeasons, targetSeason) {
    if (!targetSeason) return 100;

    const seasonCount = outfitSeasons.filter(s => s === targetSeason || s === 'all-season').length;
    return (seasonCount / outfitSeasons.length) * 100;
  }

  /**
   * Calculate versatility score (how many occasions the outfit works for)
   */
  static calculateVersatility(occasions) {
    const uniqueOccasions = [...new Set(occasions)];
    const maxVersatility = 5; // Consider highly versatile if works for 5+ occasions
    return Math.min(100, (uniqueOccasions.length / maxVersatility) * 100);
  }

  /**
   * Helper to convert HEX to HSL
   */
  static hexToHsl(hex) {
    if (!hex) return null;
    hex = hex.replace(/^#/, '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return null;
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0; 
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  static isNeutralColor(hex, colorName) {
    if (colorName) {
      const name = colorName.toLowerCase();
      if (['white', 'black', 'grey', 'gray', 'beige', 'navy', 'cream', 'khaki', 'silver', 'tan'].includes(name)) return true;
    }
    const hsl = this.hexToHsl(hex);
    if (!hsl) return false;
    if (hsl.l > 95 || hsl.l < 15 || hsl.s < 15) return true; // white, black, grey
    if (hsl.h >= 200 && hsl.h <= 260 && hsl.l < 30) return true; // navy
    if (hsl.h >= 30 && hsl.h <= 60 && hsl.s < 30 && hsl.l > 70) return true; // beige
    return false;
  }

  static getColorPairHarmony(item1, item2, reasons) {
    // Support both new AI color format, colorAnalysis format and legacy colors[] format
    const hex1 = item1.colorHex || item1.color?.primary?.hex || item1.colorAnalysis?.primary?.hex || item1.colors?.[0]?.hex;
    const hex2 = item2.colorHex || item2.color?.primary?.hex || item2.colorAnalysis?.primary?.hex || item2.colors?.[0]?.hex;
    const name1 = item1.colorName || item1.color?.primary?.name || item1.colorAnalysis?.primary?.name || item1.colors?.[0]?.name;
    const name2 = item2.colorName || item2.color?.primary?.name || item2.colorAnalysis?.primary?.name || item2.colors?.[0]?.name;

    if (!hex1 || !hex2) return 50;

    const isNeutral1 = this.isNeutralColor(hex1, name1);
    const isNeutral2 = this.isNeutralColor(hex2, name2);

    if (isNeutral1 && isNeutral2) {
      reasons.push("Neutral + Neutral");
      return 85;
    }
    if (isNeutral1 || isNeutral2) {
      reasons.push("Neutral pairs well with any color");
      return 85;
    }

    const hsl1 = this.hexToHsl(hex1);
    const hsl2 = this.hexToHsl(hex2);

    if (!hsl1 || !hsl2) return 50;

    const hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));

    if (hueDiff >= 150) {
      reasons.push("Complementary colors");
      return 90;
    }
    if (hueDiff <= 15) {
      reasons.push("Same color family");
      return 60;
    }
    if (hueDiff <= 30) {
      reasons.push("Analogous colors");
      return 80;
    }
    
    reasons.push("Clashing colors");
    return 20;
  }

  static getPatternPairScore(item1, item2, reasons) {
    // Support new AI pattern format, patternAnalysis format, and legacy formats
    const pat1 = (item1.pattern?.type || item1.patternAnalysis?.type || (typeof item1.pattern === 'string' ? item1.pattern : null) || item1.patterns?.[0] || 'solid').toLowerCase();
    const pat2 = (item2.pattern?.type || item2.patternAnalysis?.type || (typeof item2.pattern === 'string' ? item2.pattern : null) || item2.patterns?.[0] || 'solid').toLowerCase();

    const isSolid1 = pat1 === 'solid' || pat1 === 'none';
    const isSolid2 = pat2 === 'solid' || pat2 === 'none';

    if (isSolid1 && isSolid2) {
      return 0;
    }

    if (pat1 === 'graphic print' && pat2 === 'graphic print') {
      reasons.push("Two graphic prints clash");
      return -40;
    }

    if (!isSolid1 && !isSolid2) {
      reasons.push("Mixing patterns can clash");
      return -30;
    }

    if ((isSolid1 && !isSolid2) || (!isSolid1 && isSolid2)) {
      reasons.push("Solid pairs well with pattern");
      return 20;
    }

    return 0;
  }

  static getSeasonPairScore(item1, item2, reasons) {
    // Support both new AI styling.season format and top-level season[] format
    const s1 = item1.styling?.season || item1.season;
    const s2 = item2.styling?.season || item2.season;
    
    const arr1 = Array.isArray(s1) ? s1 : (s1 ? [s1] : ['all']);
    const arr2 = Array.isArray(s2) ? s2 : (s2 ? [s2] : ['all']);

    const isAll1 = arr1.includes('all') || arr1.includes('all-season');
    const isAll2 = arr2.includes('all') || arr2.includes('all-season');

    if (isAll1 || isAll2) {
      reasons.push("All-season item matches year-round");
      return 100;
    }

    const intersection = arr1.filter(s => arr2.includes(s));
    if (intersection.length > 0) {
      reasons.push("Matched seasons");
      return 100;
    }

    reasons.push("Mismatched seasons");
    return 10;
  }

  /**
   * Calculate comprehensive outfit score
   */
  static calculateOutfitScore(outfitItems, season = null, occasion = null) {
    // Extract primary colors from each item - support both new AI and legacy formats
    const colors = outfitItems.flatMap(item => {
      // Prefer color.primary or colorAnalysis.primary (new AI formats)
      if (item.color?.primary?.name) return [item.color.primary.name];
      if (item.colorAnalysis?.primary?.name) return [item.colorAnalysis.primary.name];
      // Fallback to colors[] hex-based extraction (legacy format)
      if (!item.colors || item.colors.length === 0) return [];
      const primaryHex = item.colors[0]?.hex;
      if (!primaryHex) return [];
      const colorInfo = this.getColorInfoFromHex(primaryHex);
      return colorInfo ? [colorInfo.name] : [];
    });

    // Extract styles - support both styling.style (AI) and top-level style
    const styles = outfitItems.map(item => item.styling?.style || item.style).filter(Boolean);
    
    // Extract patterns - support both pattern.type, patternAnalysis.type (AI) and patterns[] (legacy)
    const patterns = outfitItems.flatMap(item =>
      item.pattern?.type ? [item.pattern.type] :
      item.patternAnalysis?.type ? [item.patternAnalysis.type] :
      item.patterns ? item.patterns : ['none']
    );
    
    // Extract seasons - support both styling.season (AI) and top-level season[]
    const itemSeasons = outfitItems.flatMap(item =>
      item.styling?.season ? item.styling.season :
      item.season ? item.season : ['all-season']
    );
    
    // Extract occasions - support both styling.occasion (AI) and top-level occasion[]
    const occasions = outfitItems.flatMap(item =>
      item.styling?.occasion ? item.styling.occasion :
      item.occasion ? item.occasion : ['everyday']
    );

    const colorHarmony = this.calculateColorHarmony(colors);
    const styleConsistency = this.calculateStyleConsistency(styles);
    const patternCompatibility = this.checkPatternCompatibility(patterns);
    const seasonalScore = season ? this.calculateSeasonality(itemSeasons, season) : 100;
    const versatilityScore = this.calculateVersatility(occasions);

    // Weighted average
    const weights = {
      colorHarmony: 0.3,
      styleConsistency: 0.25,
      patternCompatibility: 0.15,
      seasonality: 0.15,
      versatility: 0.15
    };

    const overallMatch =
      colorHarmony * weights.colorHarmony +
      styleConsistency * weights.styleConsistency +
      patternCompatibility * weights.patternCompatibility +
      seasonalScore * weights.seasonality +
      versatilityScore * weights.versatility;

    return {
      overallMatch: Math.round(overallMatch),
      colorHarmony: Math.round(colorHarmony),
      styleConsistency: Math.round(styleConsistency),
      patternCompatibility,
      seasonality: Math.round(seasonalScore),
      versatility: Math.round(versatilityScore)
    };
  }

  /**
   * Find matching items for a given item
   */
  static findMatchesForItem(item, wardrobeItems, limit = 3) {
    const matches = [];

    wardrobeItems.forEach(wardrobeItem => {
      if (wardrobeItem._id && item._id && wardrobeItem._id.toString() === item._id.toString()) return;
      if (wardrobeItem.isAvailable === false) return;

      const reasons = [];
      const colorScore = this.getColorPairHarmony(item, wardrobeItem, reasons);
      const patternScore = this.getPatternPairScore(item, wardrobeItem, reasons);
      const seasonScore = this.getSeasonPairScore(item, wardrobeItem, reasons);

      // We weight Color 60% and Season 40% (base 100), then add/subtract the pattern bonus/penalty
      let finalScore = (colorScore * 0.6) + (seasonScore * 0.4) + patternScore;
      finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

      if (reasons.length === 0) {
        reasons.push("Pieces coordinate well");
      }

      // Resolve color name and hex from either new AI formats or legacy format
      const colorName = wardrobeItem.color?.primary?.name || wardrobeItem.colorAnalysis?.primary?.name || wardrobeItem.colorName || wardrobeItem.colors?.[0]?.name || 'Unknown';
      const colorHex = wardrobeItem.color?.primary?.hex || wardrobeItem.colorAnalysis?.primary?.hex || wardrobeItem.colorHex || wardrobeItem.colors?.[0]?.hex || '#000000';

      matches.push({
        itemId: wardrobeItem._id,
        itemName: wardrobeItem.name,
        itemType: wardrobeItem.category,
        colorName,
        colorHex,
        matchScore: finalScore,
        matchReasons: reasons,
        // Keep these for backward compatibility with `generateShoppingCombinations`
        item: wardrobeItem,
        score: finalScore,
        breakdown: { overallMatch: finalScore }
      });
    });

    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Generate outfit combinations for a new item being shopped
   */
  static generateShoppingCombinations(newItem, wardrobeItems, userPreferences = {}) {
    const { preferredColors = [], avoidColors = [], stylePreferences = [] } = userPreferences;

    // Filter out avoided colors - use new color format (hex)
    const filteredWardrobe = wardrobeItems.filter(item => {
      if (!item.colors || item.colors.length === 0) return true;
      const itemColorNames = item.colors.map(c => {
        const info = this.getColorInfoFromHex(c.hex);
        return info?.name;
      }).filter(Boolean);
      const hasAvoidedColor = itemColorNames.some(color =>
        avoidColors.includes(color.toLowerCase())
      );
      return !hasAvoidedColor;
    });

    const combinations = [];

    // Generate combinations by category - expanded for global clothing categories
    const categoryMapping = {
      tops: ['bottoms', 'shoes', 'accessories'],
      bottoms: ['tops', 'shoes', 'accessories'],
      shoes: ['tops', 'bottoms', 'accessories'],
      outerwear: ['tops', 'bottoms', 'shoes'],
      dresses: ['shoes', 'accessories', 'outerwear'],
      accessories: ['tops', 'bottoms', 'dresses'],
      // Global/traditional clothing categories
      traditional: ['shoes', 'accessories', 'outerwear'],
      ethnic: ['shoes', 'accessories', 'outerwear'],
      sarees: ['shoes', 'accessories', 'outerwear'],
      lehenga: ['shoes', 'accessories'],
      kurta: ['bottoms', 'shoes', 'accessories']
    };

    const targetCategories = categoryMapping[newItem.category] || ['tops', 'bottoms', 'shoes', 'accessories'];

    targetCategories.forEach(category => {
      const categoryItems = filteredWardrobe.filter(item => item.category === category);
      const matches = this.findMatchesForItem(newItem, categoryItems, 5);

      matches.forEach(match => {
        // Create complete outfit with additional items
        const baseItems = [newItem, match.item];
        const scores = this.calculateOutfitScore(baseItems);

        // Bonus for preferred colors - check HEX values
        const colorBonus = preferredColors.some(prefColor => {
          return match.item.colors?.some(c => {
            const info = this.getColorInfoFromHex(c.hex);
            return info?.name === prefColor?.toLowerCase();
          });
        }) ? 10 : 0;

        // Bonus for preferred style
        const matchStyle = match.item.styling?.style || match.item.style;
        const styleBonus = stylePreferences.includes(matchStyle) ? 5 : 0;

        combinations.push({
          primaryMatch: match.item,
          score: Math.min(100, scores.overallMatch + colorBonus + styleBonus),
          breakdown: scores,
          category: match.item.category,
          colorBonus,
          styleBonus,
          whyItWorks: this.explainMatch(newItem, match.item, scores)
        });
      });
    });

    return combinations
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }

  /**
   * Generate explanation for why items match
   */
  static explainMatch(item1, item2, scores) {
    const reasons = [];

    // Color harmony explanation - support both new and legacy formats
    const hex1 = item1.color?.primary?.hex || item1.colorAnalysis?.primary?.hex || item1.colors?.[0]?.hex;
    const hex2 = item2.color?.primary?.hex || item2.colorAnalysis?.primary?.hex || item2.colors?.[0]?.hex;
    const colorInfo1 = hex1 ? this.getColorInfoFromHex(hex1) : null;
    const colorInfo2 = hex2 ? this.getColorInfoFromHex(hex2) : null;
    const color1 = colorInfo1?.name;
    const color2 = colorInfo2?.name;

    if (color1 && color2) {
      if (this.colorWheel[color1]?.complementary === color2) {
        reasons.push('Complementary colors create bold, striking combinations');
      } else if (this.colorWheel[color1]?.analogous?.includes(color2)) {
        reasons.push('Analogous colors provide a harmonious, coordinated look');
      } else if (this.fashionRules.neutrals.includes(color1) || this.fashionRules.neutrals.includes(color2)) {
        reasons.push('Neutral piece lets colors shine while staying balanced');
      }
    }

    // Style explanation - support both AI and legacy formats
    const style1 = item1.styling?.style || item1.style;
    const style2 = item2.styling?.style || item2.style;
    if (style1 && style2 && style1 === style2) {
      reasons.push(`Both pieces share ${style1} style for a cohesive look`);
    }

    // Pattern explanation - support both new, old, and legacy formats
    const pattern1 = item1.pattern?.type || item1.patternAnalysis?.type || item1.patterns?.[0];
    const pattern2 = item2.pattern?.type || item2.patternAnalysis?.type || item2.patterns?.[0];
    if (pattern1 === 'solid' && pattern2 !== 'solid') {
      reasons.push('Solid base allows patterned piece to stand out');
    } else if (pattern1 === pattern2 && pattern1 !== 'solid') {
      reasons.push('Same pattern family creates visual unity');
    }

    // Season explanation - support both AI and legacy formats
    const season1 = item1.styling?.season || item1.season || [];
    const season2 = item2.styling?.season || item2.season || [];
    const sharedSeasons = (Array.isArray(season1) ? season1 : [season1]).filter(s =>
      (Array.isArray(season2) ? season2 : [season2]).includes(s)
    );
    if (sharedSeasons.length > 0) {
      reasons.push(`Perfect for ${sharedSeasons.join(' and ')}`);
    }

    return reasons.length > 0 ? reasons : ['Great combination for your wardrobe'];
  }

  /**
   * Generate outfit suggestions from scratch
   */
  static generateOutfitSuggestions(wardrobeItems, options = {}) {
    const {
      season = 'all-season',
      occasion = 'everyday',
      style = null,
      limit = 10
    } = options;

    // Filter items by criteria
    let filteredItems = wardrobeItems.filter(item => item.isAvailable !== false);

    if (season !== 'all-season') {
      filteredItems = filteredItems.filter(item => {
        const itemSeasons = item.styling?.season || item.season || [];
        const arr = Array.isArray(itemSeasons) ? itemSeasons : [itemSeasons];
        return !arr.length || arr.includes(season) || arr.includes('all-season');
      });
    }

    if (occasion !== 'everyday') {
      filteredItems = filteredItems.filter(item => {
        const itemOccasions = item.styling?.occasion || item.occasion || [];
        const arr = Array.isArray(itemOccasions) ? itemOccasions : [itemOccasions];
        return !arr.length || arr.includes(occasion) || arr.includes('everyday');
      });
    }

    if (style) {
      filteredItems = filteredItems.filter(item =>
        (item.styling?.style || item.style) === style
      );
    }

    const suggestions = [];
    const generatedCombinations = new Set();

    // Group items by category - expanded for global clothing categories
    const byCategory = {
      tops: filteredItems.filter(i => i.category === 'tops'),
      bottoms: filteredItems.filter(i => i.category === 'bottoms'),
      shoes: filteredItems.filter(i => i.category === 'shoes'),
      dresses: filteredItems.filter(i => i.category === 'dresses'),
      outerwear: filteredItems.filter(i => i.category === 'outerwear'),
      accessories: filteredItems.filter(i => i.category === 'accessories'),
      traditional: filteredItems.filter(i => i.category === 'traditional' || i.category === 'ethnic'),
      sarees: filteredItems.filter(i => i.category === 'sarees' || i.identity?.type === 'sari' || i.identity?.type === 'saree'),
      lehenga: filteredItems.filter(i => i.category === 'lehenga'),
      kurta: filteredItems.filter(i => i.category === 'kurta')
    };

    // Generate dress-based outfits (includes traditional/ethnic one-piece garments)
    const onePieceCategories = [...byCategory.dresses, ...byCategory.sarees, ...byCategory.lehenga];
    if (onePieceCategories.length > 0) {
      onePieceCategories.forEach(dress => {
        const key = `dress-${dress._id}`;

        // Add shoes
        byCategory.shoes.slice(0, 5).forEach(shoes => {
          const keyWithShoes = `${key}-${shoes._id}`;
          if (generatedCombinations.has(keyWithShoes)) return;

          const items = [dress, shoes];

          // Optional accessories
          const randomAccessory = byCategory.accessories.length > 0
            ? byCategory.accessories[Math.floor(Math.random() * byCategory.accessories.length)]
            : null;

          if (randomAccessory) {
            items.push(randomAccessory);
          }

          const scores = this.calculateOutfitScore(items, season, occasion);

          suggestions.push({
            items,
            score: scores.overallMatch,
            breakdown: scores,
            why: this.explainMatch(dress, shoes, scores)
          });

          generatedCombinations.add(keyWithShoes);
        });
      });
    }

    // Generate top-bottom combinations (includes kurtas with bottoms)
    const topItems = [...byCategory.tops, ...byCategory.kurta];
    if (topItems.length > 0 && byCategory.bottoms.length > 0) {
      topItems.slice(0, 8).forEach(top => {
        byCategory.bottoms.slice(0, 8).forEach(bottom => {
          const key = `${top._id}-${bottom._id}`;
          if (generatedCombinations.has(key)) return;

          const items = [top, bottom];

          // Add shoes
          const topShoes = this.findMatchesForItem(
            { ...top, category: top.category || 'tops' },
            byCategory.shoes.slice(0, 5),
            1
          );

          if (topShoes.length > 0) {
            items.push(topShoes[0].item);
          }

          // Add accessories optionally
          if (byCategory.accessories.length > 0 && Math.random() > 0.5) {
            const accessory = byCategory.accessories[Math.floor(Math.random() * byCategory.accessories.length)];
            items.push(accessory);
          }

          const scores = this.calculateOutfitScore(items, season, occasion);

          suggestions.push({
            items,
            score: scores.overallMatch,
            breakdown: scores,
            why: this.explainMatch(top, bottom, scores)
          });

          generatedCombinations.add(key);
        });
      });
    }

    // Add outerwear if appropriate
    suggestions.forEach(suggestion => {
      if (byCategory.outerwear.length > 0 && ['fall', 'winter', 'all-season'].includes(season)) {
        const baseItems = suggestion.items;
        const outerwearMatch = byCategory.outerwear[0]; // Simple for now

        const itemsWithOuter = [...baseItems, outerwearMatch];
        const scores = this.calculateOutfitScore(itemsWithOuter, season, occasion);

        if (scores.overallMatch > 60) {
          suggestions.push({
            items: itemsWithOuter,
            score: scores.overallMatch,
            breakdown: scores,
            why: suggestion.why
          });
        }
      }
    });

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = WardrobeAI;