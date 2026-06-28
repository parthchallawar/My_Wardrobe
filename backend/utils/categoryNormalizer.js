/**
 * Normalize any raw category/type string the AI returns into one of the
 * canonical category buckets the engine and frontend both agree on.
 *
 * Canonical values:
 *   tops | bottoms | shoes | accessories | outerwear | dresses
 *   traditional | sarees | lehenga | kurta
 */

const SYNONYM_MAP = {
  tops: [
    'top', 'tops', 't-shirt', 'tshirt', 'tee', 'shirt', 'blouse', 'sweater',
    'pullover', 'jumper', 'vest', 'tank', 'tank top', 'camisole', 'cami',
    'bodysuit', 'tunic', 'polo', 'polo shirt', 'graphic tee', 'crop top',
    'crop', 'halter', 'henley', 'knit', 'knitwear',
  ],
  bottoms: [
    'bottom', 'bottoms', 'pants', 'pant', 'jeans', 'jean', 'denim', 'trousers',
    'trouser', 'shorts', 'short', 'skirt', 'joggers', 'jogger', 'sweatpants',
    'cargo pants', 'chinos', 'chino', 'leggings', 'legging', 'capri', 'culottes',
    'palazzos',
  ],
  shoes: [
    'shoes', 'shoe', 'sneakers', 'sneaker', 'boots', 'boot', 'heels', 'heel',
    'sandals', 'sandal', 'slides', 'slide', 'loafers', 'loafer', 'oxfords',
    'oxford', 'flats', 'flat', 'pumps', 'pump', 'mules', 'mule', 'clogs',
    'clog', 'espadrilles', 'slippers', 'slipper', 'trainers', 'trainer',
    'footwear', 'flipflops', 'flip flops',
  ],
  accessories: [
    'accessory', 'accessories', 'bag', 'bags', 'watch', 'belt', 'hat', 'cap',
    'scarf', 'jewelry', 'jewellery', 'sunglasses', 'glasses', 'tie', 'bow tie',
    'bracelet', 'necklace', 'earrings', 'ring', 'wallet', 'purse', 'backpack',
    'clutch', 'handbag', 'tote', 'satchel', 'gloves', 'mittens', 'socks',
    'sock', 'headband', 'hairband', 'beanie', 'beret', 'brooch', 'pin',
  ],
  outerwear: [
    'outerwear', 'jacket', 'coat', 'blazer', 'bomber', 'cardigan', 'windbreaker',
    'parka', 'trench', 'trench coat', 'denim jacket', 'leather jacket', 'raincoat',
    'anorak', 'hoodie', 'zip-up', 'fleece', 'puffer', 'down jacket', 'vest jacket',
    'waistcoat', 'gilet',
  ],
  dresses: [
    'dress', 'dresses', 'gown', 'jumpsuit', 'romper', 'playsuit', 'midi dress',
    'maxi dress', 'mini dress', 'sundress', 'sheath', 'shift dress', 'wrap dress',
    'bodycon',
  ],
  sarees: ['saree', 'sari', 'sarees'],
  lehenga: ['lehenga', 'lehnga', 'ghagra', 'chaniya'],
  kurta: ['kurta', 'kurti', 'kameez'],
  traditional: [
    'traditional', 'ethnic', 'salwar', 'salwar kameez', 'shalwar', 'sherwani',
    'dhoti', 'lungi', 'pagri', 'turban', 'angrakha', 'bandhgala', 'achkan',
    'indo-western',
  ],
};

// Build a reverse lookup: synonym -> canonical
const REVERSE = {};
for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
  for (const s of synonyms) {
    REVERSE[s.toLowerCase()] = canonical;
  }
}

/**
 * @param {string} rawCategory  - value from AI identity.category
 * @param {string} identityType - value from AI identity.type (fallback)
 * @returns {string} canonical category
 */
function normalizeCategory(rawCategory, identityType) {
  const attempts = [rawCategory, identityType].filter(Boolean);
  for (const val of attempts) {
    const key = val.toLowerCase().trim();
    if (REVERSE[key]) return REVERSE[key];
    // partial match: check if any canonical appears inside the string
    for (const canonical of Object.keys(SYNONYM_MAP)) {
      if (key.includes(canonical)) return canonical;
    }
  }
  return 'accessories'; // safe fallback
}

module.exports = { normalizeCategory, SYNONYM_MAP, REVERSE };
