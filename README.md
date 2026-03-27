# StyleAI - AI Wardrobe Assistant

A cutting-edge AI-powered wardrobe management application that helps you track your outfits, generate perfect combinations, and get smart shopping recommendations.

## ⚡ Features

### 🎨 Wardrobe Management
- **Digital Wardrobe** - Catalog all your clothing items with images, colors, styles, and tags
- **Smart Categorization** - Automatic categorization by type (tops, bottoms, shoes, accessories, etc.)
- **Favorite System** - Mark your favorite pieces for quick access
- **Wear Tracking** - Track how often you wear each item

### 🤖 AI-Powered Features
- **Smart Outfit Generation** - AI creates complete outfit combinations based on your wardrobe
- **Shop Match** - Before buying, see how a new item matches with your existing wardrobe
- **Color Harmony Analysis** - Advanced color theory to score combinations
- **Style Consistency** - Ensure your outfits match your preferred style
- **Seasonal Recommendations** - Get outfit suggestions for any season

### 📊 Analytics & Insights
- **Wardrobe Statistics** - Visual breakdown of your collection
- **Usage Analytics** - See your most and least worn items
- **Style Analysis** - Discover your dominant style preferences
- **Color Palette** - Visualize your wardrobe color distribution
- **Smart Suggestions** - AI recommendations to improve your wardrobe

### 🛍️ Shopping Assistant
- **Real-time Compatibility** - Check if a new item matches before buying
- **Gap Detection** - Identify missing categories to complete looks
- **Purchase Recommendations** - Get suggestions for future purchases

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Query** - Data fetching
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons

### AI Engine
- Custom **WardrobeAI** engine with:
  - Color theory algorithms
  - Style compatibility matrix
  - Pattern conflict detection
  - Seasonality scoring
  - Versatility metrics

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas connection
- Git

### Clone the Repository
```bash
git clone <repository-url>
cd wardrobe-ai
```

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wardrobe-ai
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎯 Usage

### 1. Register / Login
- Create an account with email, username, and password
- Or sign in if you already have an account

### 2. Build Your Wardrobe
- Navigate to **Wardrobe** section
- Click **Add Item** to catalog your clothes
- Enter details like:
  - Name
  - Category (tops, bottoms, shoes, etc.)
  - Primary and secondary colors
  - Style (casual, formal, etc.)
  - Season and occasion preferences

### 3. Generate Outfits
- Go to **Outfits** section
- Click **AI Generate** to create outfit combinations
- View match scores and why each combination works
- Save your favorites

### 4. Shop Match
- Before buying something new, use **Shop Match**
- Enter details about the item you're considering
- See how it matches with your existing wardrobe
- Get compatibility scores and styling tips

### 5. View Insights
- Check **Insights** for wardrobe analytics
- See your style preferences, color palette, usage stats
- Get AI recommendations to improve your collection

### 6. Customize Preferences
- Go to **Settings** to set your style preferences
- Choose favorite colors to avoid
- Set active seasons
- Configure your look

## 🎨 Design Philosophy

The application features a stunning **neon green and black** theme with:

- **Smooth Animations** - Page transitions, hover effects, micro-interactions
- **Glass Morphism** - Modern frosted glass effects
- **Neon Glows** - Eye-catching glowing elements
- **Responsive Design** - Works on desktop and mobile
- **Grid Pattern Background** - Subtle futuristic backdrop

## 📁 Project Structure

```
wardrobe-ai/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all wardrobe items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/favorite` - Toggle favorite
- `POST /api/items/:id/wear` - Record wear
- `GET /api/items/statistics/summary` - Get wardrobe stats

### Outfits
- `GET /api/outfits` - Get all outfits
- `GET /api/outfits/:id` - Get single outfit
- `POST /api/outfits` - Create outfit
- `PUT /api/outfits/:id` - Update outfit
- `DELETE /api/outfits/:id` - Delete outfit
- `POST /api/outfits/generate` - AI generate outfits

### AI Features
- `POST /api/ai/shop-match` - Match new item with wardrobe
- `POST /api/ai/match-items` - Find matching items
- `POST /api/ai/analyze-outfits` - Analyze outfit combinations
- `GET /api/ai/style-insights` - Get style insights
- `POST /api/ai/recommend-purchases` - Get purchase recommendations
- `GET /api/ai/colors` - Get available colors
- `GET /api/ai/seasonal-guide` - Get seasonal styling guide

### Users
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences
- `PUT /api/users/profile` - Update profile
- `DELETE /api/users/account` - Delete account

## 🧠 AI Algorithm Details

### Color Harmony Scoring
- **Complementary Colors** - High score (95%)
- **Analogous Colors** - Good score (85%)
- **Same Temperature** - Decent score (70%)
- **Neutral Colors** - Universal compatibility

### Style Compatibility Matrix
8x8 matrix scoring style combinations from sporty to glam

### Pattern Rules
- Maximum 2 patterns per outfit
- Pattern conflict detection (e.g., plaid + stripes)
- Solids work with any pattern

### Scoring Weights
- Color Harmony: 30%
- Style Consistency: 25%
- Pattern Compatibility: 15%
- Seasonality: 15%
- Versatility: 15%

## 🚀 Deployment

### Backend Deployment (e.g., Vercel, Railway, Render)
1. Set environment variables
2. Deploy MongoDB Atlas if not using local
3. Deploy the backend

### Frontend Deployment (e.g., Vercel, Netlify)
1. Set `VITE_API_URL` to deployed backend URL
2. Run `npm run build`
3. Deploy the built files

## 📝 Future Enhancements

- [ ] Image upload with AI color detection
- [ ] Outfit calendar planning
- [ ] Social sharing of outfits
- [ ] Community outfit inspiration
- [ ] Weather-based outfit suggestions
- [ ] Integration with online shopping platforms
- [ ] Mobile app (React Native)
- [ ] Premium subscription features

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## ⚠️ Important Notes

- MongoDB must be running before starting the backend
- JWT_SECRET should be changed in production
- The AI matching engine is rule-based (not machine learning) but can be extended
- Image upload feature will need additional storage service (e.g., Cloudinary, AWS S3)

## 🐛 Troubleshooting

**Backend won't start:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend .env
- Check CORS settings in server.js

**Login issues:**
- Clear browser storage
- Check JWT_SECRET matches
- Verify MongoDB connection

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using MERN Stack + AI
