/**
 * Patches the seeded clothing items with real Unsplash clothing photo URLs.
 * Usage: node backend/scripts/patchItemImages.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Item = require('../models/Item');
const User = require('../models/User');

const USER_EMAIL = process.env.SEED_USER_EMAIL || 'parth123@gmail.com';

// Curated Unsplash clothing photo IDs — ?w=600&h=750&fit=crop keeps them portrait
const BASE = 'https://images.unsplash.com/photo-';
const Q = '?w=600&h=750&fit=crop&q=80';

const IMAGE_MAP = {
  'White Oxford Shirt':       BASE + '1596755094514-f87e34085b2c' + Q,
  'Navy Blue Slim Jeans':     BASE + '1542272604-787c3835535d'    + Q,
  'Black Slim Blazer':        BASE + '1507003211169-0a1dd7228f2d' + Q,
  'Heather Grey Sweatshirt':  BASE + '1556821840-3a63f15732ce'    + Q,
  'Khaki Slim Chinos':        BASE + '1473966968600-fa801b869a1a' + Q,
  'White Leather Sneakers':   BASE + '1542291026-7eec264c27ff'    + Q,
  'Black Chelsea Boots':      BASE + '1606107557195-0e29a4b5b4aa' + Q,
  'Olive Bomber Jacket':      BASE + '1551537482-f2075a1d41f2'    + Q,
  'Burgundy Polo Shirt':      BASE + '1586363104862-3a5e2ab60d99' + Q,
  'Charcoal Slim Trousers':   BASE + '1594938298603-e8d9a74756e3' + Q,
  'Camel Trench Coat':        BASE + '1539533018257-39c58c6a27b8' + Q,
  'Light Blue Denim Jacket':  BASE + '1523205771623-e0faa4d2813d' + Q,
};

async function patch() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wardrobe-ai');
  console.log('✅ MongoDB connected');

  const user = await User.findOne({ email: USER_EMAIL });
  if (!user) { console.error('❌ User not found:', USER_EMAIL); process.exit(1); }

  let updated = 0;
  for (const [name, url] of Object.entries(IMAGE_MAP)) {
    const res = await Item.updateOne(
      { user: user._id, name },
      { $set: { imageUrl: url, images: [{ url, isPrimary: true }] } }
    );
    if (res.modifiedCount) {
      console.log(`  ✔ ${name}`);
      updated++;
    } else {
      console.log(`  ✗ not found: ${name}`);
    }
  }

  console.log(`\n🎉 Patched ${updated}/${Object.keys(IMAGE_MAP).length} items with Unsplash images.`);
  await mongoose.disconnect();
}

patch().catch(err => { console.error(err); process.exit(1); });
