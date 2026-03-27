# StyleAI Implementation Guide

## Project Overview

StyleAI is a comprehensive AI-powered wardrobe management application built with the MERN stack (MongoDB, Express, React, Node.js). The application uses custom algorithms to provide intelligent outfit matching, color harmony analysis, and style recommendations.

---

## Step 1: Project Initialization ✅

The complete project structure has been created at:
```
C:\Users\parth\projects\wardrobe-ai\
```

### Folder Structure:
```
wardrobe-ai/
├── backend/           # Node.js/Express server
│   ├── models/        # Mongoose schemas (User, Item, Outfit)
│   ├── routes/        # API routes (auth, items, outfits, ai, users)
│   ├── middleware/    # Express middleware (auth, error handling, rate limiting)
│   ├── utils/         # WardrobeAI engine (color theory, matching algorithms)
│   ├── server.js      # Main server entry point
│   └── package.json
│
├── frontend/          # React application
│   ├── src/
│   │   ├── components/layout/  # Header, Sidebar
│   │   ├── pages/              # All page components
│   │   ├── services/           # API client
│   │   ├── store/              # Zustand state management
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── setup.bat          # Quick setup script
├── start-backend.bat  # Start backend serverfix
├── start-frontend.bat # Start frontend app
└── README.md
```

---

## Step 2: Environment Configuration

### Create Backend Environment Variables
File: `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wardrobe-ai
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### Create Frontend Environment Variables
File: `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 3: MongoDB Setup

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB:**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use: `choco install mongodb-community` (if using Chocolatey)

2. **Start MongoDB Service:**
   ```bash
   # Windows
   net start MongoDB
   # OR
   mongod --dbpath "C:\data\db"
   ```

3. **Verify Installation:**
   ```bash
   mongo
   # Then run:
   db.version()
   ```

### Option B: MongoDB Atlas (Cloud)

1. Create account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env

---

## Step 4: Install Dependencies

### Automated Setup (Windows)
```bash
cd C:\Users\parth\projects\wardrobe-ai
setup.bat
```

### Manual Setup

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## Step 5: Run the Application

### Start Backend Server
```bash
# Option 1: Using batch file
start-backend.bat

# Option 2: Manual
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### Start Frontend Application
```bash
# Option 2: Using batch file
start-frontend.bat

# Option 2: Manual
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## Step 6: Application Flow

### 1. User Registration & Authentication
```
User → Register → Create Account → JWT Token → Dashboard
User → Login → Validate Credentials → JWT Token → Dashboard
```

**Files involved:**
- `backend/routes/auth.js` - Authentication endpoints
- `backend/models/User.js` - User schema
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

### 2. Wardrobe Management
```
Dashboard → Add Item → Save to Database → WardrobeAI Analysis → Find Matches
```

**Files involved:**
- `backend/routes/items.js` - Item CRUD operations
- `backend/models/Item.js` - Item schema with AI features
- `frontend/src/pages/Wardrobe.jsx` - Wardrobe UI
- `backend/utils/wardrobeAI.js` - Matching engine

### 3. AI Outfit Generation
```
Wardrobe → Generate Outfits → WardrobeAI Engine → Score & Rank → Save
```

**Files involved:**
- `backend/routes/outfits.js` - Outfit endpoints
- `backend/models/Outfit.js` - Outfit schema
- `frontend/src/pages/Outfits.jsx` - Outfit UI
- `backend/utils/wardrobeAI.js` - Generation algorithm

### 4. Shop Match Feature
```
Shop Match → Enter New Item Details → Analyze Against Wardrobe → Show Combinations
```

**Files involved:**
- `backend/routes/ai.js` - AI endpoints
- `frontend/src/pages/ShopMatch.jsx` - Shop match UI
- `backend/utils/wardrobeAI.js` - Matching algorithm

### 5. Insights & Analytics
```
Wardrobe Data → Aggregate Statistics → Visual Charts → AI Recommendations
```

**Files involved:**
- `backend/routes/ai.js` - Insights endpoint
- `frontend/src/pages/Insights.jsx` - Analytics UI with Recharts

---

## Step 7: Understanding the AI Engine

### Core Algorithm (`backend/utils/wardrobeAI.js`)

The WardrobeAI class implements:

#### 1. **Color Harmony Scoring**
```javascript
// Complementary colors (opposite on color wheel)
// Analogous colors (adjacent on color wheel)
// Temperature matching (warm/warm, cool/cool)
// Neutral colors (universal compatibility)
```

#### 2. **Style Compatibility Matrix**
```javascript
// 8x8 matrix scoring style combinations
// Examples:
// - Casual + Sporty = 70% compatibility
// - Formal + Glam = 85% compatibility
// - Casual + Formal = 30% compatibility
```

#### 3. **Pattern Rules**
```javascript
// Maximum 2 patterns per outfit
// Pattern conflicts (e.g., plaid + stripes)
// Solids work with any pattern
```

#### 4. **Scoring Formula**
```javascript
Overall Score =
  (Color Harmony × 0.30) +
  (Style Consistency × 0.25) +
  (Pattern Compatibility × 0.15) +
  (Seasonality × 0.15) +
  (Versatility × 0.15)
```

---

## Step 8: Database Schema

### User Model (`backend/models/User.js`)
```javascript
{
  email: String (unique),
  username: String (unique),
  password: String (hashed),
  preferences: {
    stylePreferences: [String],
    preferredColors: [String],
    avoidColors: [String],
    seasons: [String]
  },
  wardrobeStats: {
    totalItems: Number,
    categories: { tops, bottoms, shoes, etc. }
  },
  subscription: {
    plan: 'free' | 'premium',
    validUntil: Date
  }
}
```

### Item Model (`backend/models/Item.js`)
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  category: 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'outerwear' | 'dresses',
  colors: [{ primary, secondary, tertiary }],
  style: 'casual' | 'formal' | ...,
  patterns: ['solid' | 'striped' | ...],
  season: ['spring' | 'summer' | ...],
  occasion: ['everyday' | 'work' | ...],
  images: [{ url, publicId }],
  isFavorite: Boolean,
  wearCount: Number,
  aiFeatures: {
    colorAnalysis: { warm, cool, neutral },
    compatibilityScore: Number,
    trendingScore: Number
  }
}
```

### Outfit Model (`backend/models/Outfit.js`)
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  items: [{ item: ObjectId, type: String }],
  season: String,
  occasion: String,
  style: String,
  colorScheme: { primary, secondary, accent },
  aiScore: {
    overallMatch: Number,
    colorHarmony: Number,
    styleConsistency: Number,
    seasonality: Number,
    versatility: Number
  },
  generatedBy: 'ai' | 'user' | 'hybrid',
  isFavorite: Boolean,
  wornCount: Number
}
```

---

## Step 9: Frontend Design System

### Color Theme (Neon Green & Black)
```css
Neon Green: #39FF14
Neon Green Dark: #2EE012
Neon Green Light: #5CFF3D
Black Shades: #0a0a0a to #000000
```

### Key Components

#### 1. **Animated Background**
- Grid pattern overlay
- Gradient backgrounds
- Glass morphism effects

#### 2. **Micro-interactions**
- Hover scale effects
- Click feedback
- Smooth page transitions (Framer Motion)

#### 3. **Animations**
- `glow` - Neon glow effect
- `float` - Floating animation
- `slide-up/down/left/right` - Page transitions
- `fade-in` - Opacity fade
- `scale-in` - Scale entrance

---

## Step 10: API Endpoints Reference

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
```

### Items
```
GET    /api/items              - Get all items
GET    /api/items/:id          - Get single item
POST   /api/items              - Create item
PUT    /api/items/:id          - Update item
DELETE /api/items/:id          - Delete item
POST   /api/items/:id/favorite - Toggle favorite
POST   /api/items/:id/wear     - Record wear
GET    /api/items/statistics/summary - Get stats
```

### Outfits
```
GET    /api/outfits            - Get all outfits
GET    /api/outfits/:id        - Get single outfit
POST   /api/outfits            - Create outfit
PUT    /api/outfits/:id        - Update outfit
DELETE /api/outfits/:id        - Delete outfit
POST   /api/outfits/generate   - AI generate outfits
```

### AI
```
POST   /api/ai/shop-match         - Match new item
POST   /api/ai/match-items        - Find matches
POST   /api/ai/analyze-outfits    - Analyze combinations
GET    /api/ai/style-insights     - Get insights
POST   /api/ai/recommend-purchases - Get recommendations
GET    /api/ai/colors            - Get color theory data
GET    /api/ai/seasonal-guide    - Get seasonal tips
```

### Users
```
GET    /api/users/preferences    - Get preferences
PUT    /api/users/preferences    - Update preferences
PUT    /api/users/profile        - Update profile
DELETE /api/users/account       - Delete account
```

---

## Step 11: Development Workflow

### Adding New Features

1. **Update Backend:**
   - Add route in appropriate `routes/` file
   - Add/update model if needed
   - Update WardrobeAI logic if AI-related

2. **Update Frontend:**
   - Create/modify page component in `pages/`
   - Add API calls in `frontend/src/services/api.js`
   - Update state management if needed in `store/`

3. **Test:**
   - Restart backend server
   - Refresh frontend
   - Test the feature

---

## Step 12: Deployment Guide

### Backend Deployment (e.g., Render, Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-production-secret
   NODE_ENV=production
   PORT=5000
   ```
4. Deploy

### Frontend Deployment (e.g., Vercel, Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
4. Deploy

---

## Step 13: Troubleshooting

### Backend Issues

**Problem: MongoDB connection error**
```
Solution:
1. Ensure MongoDB is running (mongod command)
2. Check MONGODB_URI in .env file
3. Verify MongoDB Atlas connection if using cloud
```

**Problem: Port 5000 already in use**
```
Solution:
1. Change PORT in backend/.env to 5001
2. Or kill process using port 5000:
   netstat -ano | findstr :5000
   taskkill /pid <PID> /f
```

### Frontend Issues

**Problem: Cannot connect to backend**
```
Solution:
1. Check VITE_API_URL in frontend/.env
2. Verify backend is running
3. Check CORS settings in server.js
```

**Problem: Build errors**
```
Solution:
1. Clear node_modules and reinstall:
   rmdir /s node_modules
   npm install
2. Check for missing dependencies in package.json
```

---

## Step 14: Future Enhancements

### Planned Features
- [ ] Image upload with Cloudinary/AWS S3
- [ ] AI color detection from images
- [ ] Outfit calendar planning
- [ ] Social sharing
- [ ] Weather-based suggestions
- [ ] Integration with online shopping APIs
- [ ] Mobile app (React Native)
- [ ] Premium subscription tiers

### AI Improvements
- [ ] Machine learning for personalized recommendations
- [ ] Trend analysis using Instagram/Pinterest data
- [ ] Body type considerations
- [ ] Occasion-specific styling suggestions

---

## Summary

The StyleAI project is now fully implemented with:

✅ **Backend**: Complete REST API with authentication, CRUD operations, and AI endpoints
✅ **Frontend**: Stunning React UI with animations, responsive design, and modern UX
✅ **AI Engine**: Custom algorithms for color theory, style matching, and outfit generation
✅ **Database**: MongoDB models for users, items, and outfits
✅ **Documentation**: README, implementation guide, setup scripts

**To start using:**
1. Run `setup.bat` to install dependencies
2. Ensure MongoDB is running
3. Run `start-backend.bat` in one terminal
4. Run `start-frontend.bat` in another terminal
5. Open `http://localhost:3000` in your browser

---

For questions or issues, refer to the main README.md file.
