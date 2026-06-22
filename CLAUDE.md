# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

Monorepo with two independent Node projects:

```
wardrobe-ai/
├── backend/      # Express API (CommonJS, port 5000)
└── frontend/     # React + Vite SPA (ESM, port 3000)
```

Both need to be started separately. No root-level `package.json`.

## Commands

### Backend (`cd backend`)
```bash
npm run dev      # nodemon, auto-restarts on changes
npm start        # production (node server.js)
npm test         # jest (unit tests)
```

Required `.env` in `backend/`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wardrobe-ai
JWT_SECRET=your_secret
NVIDIA_NIM_API_KEY=your_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (`cd frontend`)
```bash
npm run dev      # Vite dev server on port 3000
npm run build    # production build → dist/
npm run preview  # serve built dist/
```

Required `.env` in `frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

The Vite dev server proxies `/api` → `http://localhost:5000`, so in dev you can omit `VITE_API_URL`.

## Architecture

### Backend

**Entry point:** `server.js` registers all routes under `/api/*` with rate limiting and JWT auth middleware.

**Routes:**
| Route | File | Description |
|-------|------|-------------|
| `/api/auth` | `routes/auth.js` | Register/login/me |
| `/api/items` | `routes/items.js` | CRUD + image upload + wear tracking |
| `/api/outfits` | `routes/outfits.js` | Outfit CRUD + AI generation |
| `/api/ai` | `routes/ai.js` | Rule-based AI endpoints (shop-match, insights, etc.) |
| `/api/analyze` | `routes/analyze.js` | Image analysis via NVIDIA NIM |
| `/api/users` | `routes/users.js` | Profile/preferences |

**AI Image Analysis flow:**
1. `POST /api/analyze` receives an image via multer (memory storage, max 5MB)
2. `services/clothingAnalysis.js` sends the buffer as a base64 data URI to the NVIDIA NIM Vision API (`meta/llama-3.2-90b-vision-instruct`) via an OpenAI-compatible client
3. Returns a deep JSON structure: `identity`, `color`, `pattern`, `fit`, `construction`, `dimensions`, `styling`, `matching`, `condition`, `confidence`
4. Response includes `imageBase64` (data URI of the uploaded image)

**Saving items with AI data:**
- Frontend submits `aiData` as a JSON string in FormData alongside user-editable fields
- `routes/items.js` → `mergeAiData()` sanitizes and maps the AI JSON into Mongoose schema fields using an `ensureObject()` helper (guards against the AI returning strings where objects are expected)
- After merging, `aiData` is deleted from `itemData` and `aiAnalyzed: true` is set
- The Item schema uses `strict: false` to allow storing AI sub-documents not explicitly typed

**Image storage:** Multer memory storage + converted to base64 data URLs via `middleware/upload.js` → `toDataUrl()`. No external storage service (Cloudinary package is installed but unused).

**Color detection (server-side):** `utils/colorDetection.js` uses the `colorthief` library on image buffers/URLs.

### Frontend

**`@` path alias** resolves to `src/` (configured in `vite.config.js`).

**Auth:** JWT stored in Zustand store (`useStore`) and persisted to `localStorage` under key `wardrobe-ai-storage`. The axios instance in `services/api.js` reads the token from localStorage on every request. A 401 response clears storage and redirects to `/login`.

**State management:**
- `src/store/useStore.js` — Zustand with `persist` middleware; holds auth (token, user), UI (sidebarOpen), wardrobe selection, filters, and shopping item
- React Query (v3) for server data fetching/caching; cache key convention: `'wardrobe-items'`, `['item', id]`, etc.

**API layer:** `src/services/api.js` exports typed API objects (`authAPI`, `itemsAPI`, `outfitsAPI`, `aiAPI`, `usersAPI`) and a shared `getImageUrl()` helper that handles http URLs, Cloudinary URLs, and `data:` URIs uniformly.

**Add Item flow (2-step wizard in `AddItemModal.jsx`):**
1. Step 1 — drag-and-drop image upload (react-dropzone), then "Analyze" calls `aiAPI.analyzeImage()`
2. Client-side dominant color extraction via canvas in `src/utils/colorExtractor.js`
3. AI response pre-fills the form; `fullAiResponse` object is stored in component state
4. Step 2 — user reviews/edits fields, submits; `aiData` (the full AI response) is sent along with form fields

**Styling:** Tailwind CSS with a custom dark neon-green theme. Custom classes defined in `tailwind.config.js`: `neon-green`, `black-600/700/800/900`, `glass` (frosted glass), `grid-pattern` (animated background). Component styling relies heavily on these custom utilities.

**Color extractor:** `src/utils/colorExtractor.js` — pure client-side canvas sampling on a 50×50 downsampled image, returning a hex value and a human-readable color name.

### Data Model

The `Item` Mongoose model has two layers of fields:
1. **Top-level simple fields:** `name`, `category`, `style`, `brand`, `season`, `tags`, `colors[]`, `images[]`, `isFavorite`, `wearCount`, `aiAnalyzed`
2. **Deep AI fields** (nested objects mirroring the NVIDIA NIM response schema): `identity`, `color`, `pattern`, `fit`, `construction`, `dimensions`, `styling`, `matching`, `condition`, `confidence`

When `mergeAiData()` runs, it auto-populates top-level fields (`category`, `style`, `fabric`, `patterns`, `season`, `occasion`, `tags`) from the AI data only if those fields weren't already provided by the user.
