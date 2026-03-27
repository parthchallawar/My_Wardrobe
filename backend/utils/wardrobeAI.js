/**
 * AI Wardrobe Matching Engine
 * Handles color theory, style matching, and outfit generation algorithms
 */

class WardrobeAI {
  // Color harmony rules and relationships
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
    silver: { complementary: 'navy', analogous: ['gray', 'white'], temperature: 'neutral' }
  };

  // Style compatibility matrix
  static styleCompatibility = {
    casual: { casual: 100, formal: 30, sporty: 70, bohemian: 60, minimalist: 80, vintage: 50, streetwear: 90, glam: 40 },
    formal: { casual: 30, formal: 100, sporty: 10, bohemian: 20, minimalist: 90, vintage: 40, streetwear: 20, glam: 85 },
    sporty: { casual: 70, formal: 10, sporty: 100, bohemian: 30, minimalist: 50, vintage: 20, streetwear: 80, glam: 20 },
    bohemian: { casual: 60, formal: 20, sporty: 30, bohemian: 100, minimalist: 40, vintage: 90, streetwear: 50, glam: 60 },
    minimalist: { casual: 80, formal: 90, sporty: 50, bohemian: 40, minimalist: 100, vintage: 70, streetwear: 60, glam: 75 },
    vintage: { casual: 50, formal: 40, sporty: 20, bohemian: 90, minimalist: 70, vintage: 100, streetwear: 40, glam: 65 },
    streetwear: { casual: 90, formal: 20, sporty: 80, bohemian: 50, minimalist: 60, vintage: 40, streetwear: 100, glam: 30 },
    glam: { casual: 40, formal: 85, sporty: 20, bohemian: 60, minimalist: 75, vintage: 65, streetwear: 30, glam: 100 }
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
   * Calculate comprehensive outfit score
   */
  static calculateOutfitScore(outfitItems, season = null, occasion = null) {
    const colors = outfitItems.flatMap(item =>
      item.colors ? [item.colors[0]?.primary] : []
    ).filter(Boolean);

    const styles = outfitItems.map(item => item.style).filter(Boolean);
    const patterns = outfitItems.flatMap(item =>
      item.patterns ? item.patterns : ['none']
    );
    const seasons = outfitItems.flatMap(item =>
      item.season ? item.season : ['all-season']
    );
    const occasions = outfitItems.flatMap(item =>
      item.occasion ? item.occasion : ['everyday']
    );

    const colorHarmony = this.calculateColorHarmony(colors);
    const styleConsistency = this.calculateStyleConsistency(styles);
    const patternCompatibility = this.checkPatternCompatibility(patterns);
    const seasonalScore = season ? this.calculateSeasonality(seasons, season) : 100;
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
      seasonality: Math.round(seasonScore),
      versatility: Math.round(versatilityScore)
    };
  }

  /**
   * Find matching items for a given item
   */
  static findMatchesForItem(item, wardrobeItems, limit = 10) {
    const matches = [];

    wardrobeItems.forEach(wardrobeItem => {
      if (wardrobeItem._id.toString() === item._id.toString()) return;
      if (!wardrobeItem.isAvailable) return;

      const score = this.calculateOutfitScore([item, wardrobeItem]);
      matches.push({
        item: wardrobeItem,
        score: score.overallMatch,
        breakdown: score
      });
    });

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate outfit combinations for a new item being shopped
   */
  static generateShoppingCombinations(newItem, wardrobeItems, userPreferences = {}) {
    const { preferredColors = [], avoidColors = [], stylePreferences = [] } = userPreferences;

    // Filter out avoided colors
    const filteredWardrobe = wardrobeItems.filter(item => {
      const itemColors = item.colors?.map(c => c.primary) || [];
      const hasAvoidedColor = itemColors.some(color =>
        avoidColors.includes(color.toLowerCase())
      );
      return !hasAvoidedColor;
    });

    const combinations = [];

    // Generate combinations by category
    const categoryMapping = {
      tops: ['bottoms', 'shoes', 'accessories'],
      bottoms: ['tops', 'shoes', 'accessories'],
      shoes: ['tops', 'bottoms', 'accessories'],
      outerwear: ['tops', 'bottoms', 'shoes'],
      dresses: ['shoes', 'accessories', 'outerwear'],
      accessories: ['tops', 'bottoms', 'dresses']
    };

    const targetCategories = categoryMapping[newItem.category] || [];

    targetCategories.forEach(category => {
      const categoryItems = filteredWardrobe.filter(item => item.category === category);
      const matches = this.findMatchesForItem(newItem, categoryItems, 5);

      matches.forEach(match => {
        // Create complete outfit with additional items
        const baseItems = [newItem, match.item];
        const scores = this.calculateOutfitScore(baseItems);

        // Bonus for preferred colors
        const colorBonus = preferredColors.some(prefColor =>
          match.item.colors?.some(c => c.primary === prefColor?.toLowerCase())
        ) ? 10 : 0;

        // Bonus for preferred style
        const styleBonus = stylePreferences.includes(match.item.style) ? 5 : 0;

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

    // Color harmony explanation
    const color1 = item1.colors?.[0]?.primary;
    const color2 = item2.colors?.[0]?.primary;

    if (this.colorWheel[color1]?.complementary === color2) {
      reasons.push('Complementary colors create bold, striking combinations');
    } else if (this.colorWheel[color1]?.analogous?.includes(color2)) {
      reasons.push('Analogous colors provide a harmonious, coordinated look');
    } else if (this.fashionRules.neutrals.includes(color1) || this.fashionRules.neutrals.includes(color2)) {
      reasons.push('Neutral piece lets colors shine while staying balanced');
    }

    // Style explanation
    if (item1.style === item2.style) {
      reasons.push(`Both pieces share ${item1.style} style for a cohesive look`);
    }

    // Pattern explanation
    const pattern1 = item1.patterns?.[0];
    const pattern2 = item2.patterns?.[0];
    if (pattern1 === 'solid' && pattern2 !== 'solid') {
      reasons.push('Solid base allows patterned piece to stand out');
    } else if (pattern1 === pattern2 && pattern1 !== 'solid') {
      reasons.push('Same pattern family creates visual unity');
    }

    // Season explanation
    const sharedSeasons = (item1.season || []).filter(s =>
      (item2.season || []).includes(s)
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
    let filteredItems = wardrobeItems.filter(item => item.isAvailable);

    if (season !== 'all-season') {
      filteredItems = filteredItems.filter(item =>
        !item.season?.length || item.season.includes(season) || item.season.includes('all-season')
      );
    }

    if (occasion !== 'everyday') {
      filteredItems = filteredItems.filter(item =>
        !item.occasion?.length || item.occasion.includes(occasion) || item.occasion.includes('everyday')
      );
    }

    if (style) {
      filteredItems = filteredItems.filter(item =>
        item.style === style
      );
    }

    const suggestions = [];
    const generatedCombinations = new Set();

    // Group items by category
    const byCategory = {
      tops: filteredItems.filter(i => i.category === 'tops'),
      bottoms: filteredItems.filter(i => i.category === 'bottoms'),
      shoes: filteredItems.filter(i => i.category === 'shoes'),
      dresses: filteredItems.filter(i => i.category === 'dresses'),
      outerwear: filteredItems.filter(i => i.category === 'outerwear'),
      accessories: filteredItems.filter(i => i.category === 'accessories')
    };

    // Generate dress-based outfits
    if (byCategory.dresses.length > 0) {
      byCategory.dresses.forEach(dress => {
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

    // Generate top-bottom combinations
    if (byCategory.tops.length > 0 && byCategory.bottoms.length > 0) {
      byCategory.tops.slice(0, 8).forEach(top => {
        byCategory.bottoms.slice(0, 8).forEach(bottom => {
          const key = `${top._id}-${bottom._id}`;
          if (generatedCombinations.has(key)) return;

          const items = [top, bottom];

          // Add shoes
          const topShoes = this.findMatchesForItem(
            { ...top, category: 'tops' },
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
