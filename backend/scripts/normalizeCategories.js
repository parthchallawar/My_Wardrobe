/**
 * One-off backfill: normalize item.category for all existing items.
 * Run once after deploying Phase 1:
 *   node backend/scripts/normalizeCategories.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Item = require('../models/Item');
const { normalizeCategory } = require('../utils/categoryNormalizer');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wardrobe-ai');
  console.log('Connected to MongoDB');

  const items = await Item.find({}, 'category identity');
  console.log(`Found ${items.length} items to check`);

  let updated = 0;
  for (const item of items) {
    const canonical = normalizeCategory(item.category, item.identity?.type);
    if (canonical !== item.category) {
      await Item.updateOne({ _id: item._id }, { $set: { category: canonical } });
      updated++;
      console.log(`  ${item._id}: "${item.category}" → "${canonical}"`);
    }
  }

  console.log(`Done. Updated ${updated} of ${items.length} items.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
