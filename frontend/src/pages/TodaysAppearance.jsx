import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wand2,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  Zap,
  MapPin,
  RefreshCw,
  Bookmark,
  Shirt,
  Sparkles,
  ThermometerSun,
} from 'lucide-react';
import { outfitsAPI, getImageUrl } from '@/services/api';
import toast from 'react-hot-toast';

// Map an OpenWeather "main" condition to an icon + accent
const conditionVisual = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return { Icon: Zap, tint: 'text-yellow-300' };
  if (c.includes('snow')) return { Icon: CloudSnow, tint: 'text-blue-200' };
  if (c.includes('rain') || c.includes('drizzle')) return { Icon: CloudRain, tint: 'text-blue-300' };
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return { Icon: CloudFog, tint: 'text-gray-300' };
  if (c.includes('cloud')) return { Icon: Cloud, tint: 'text-gray-300' };
  return { Icon: Sun, tint: 'text-yellow-400' };
};

const catToType = {
  tops: 'top', bottoms: 'bottom', shoes: 'shoes', outerwear: 'layer',
  dresses: 'dress', accessories: 'accessory', traditional: 'top',
  kurta: 'top', sarees: 'dress', lehenga: 'dress',
};

const todayLabel = () =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

const LookCollage = ({ items, large }) => {
  const imgs = items.map((i) => getImageUrl(i.image)).filter(Boolean);
  if (imgs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black-700 to-black-800">
        <Shirt className="w-10 h-10 text-gray-700" />
      </div>
    );
  }
  return (
    <div className={`grid h-full w-full gap-1 ${imgs.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${imgs.length > 2 ? 'grid-rows-2' : ''}`}>
      {imgs.slice(0, 4).map((src, i) => (
        <div key={i} className={`relative overflow-hidden ${imgs.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
          <img src={src} alt="" className="w-full h-full object-cover" />
          {i === 3 && imgs.length > 4 && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center text-white font-bold">
              +{imgs.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TodaysAppearance = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [geoState, setGeoState] = useState('pending'); // pending | ready | denied | unsupported
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Ask for location once on mount (used only to fetch weather server-side)
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoState('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoState('ready');
      },
      () => setGeoState('denied'),
      { timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const body = coords ? { lat: coords.lat, lon: coords.lon } : {};
      const res = await outfitsAPI.generateToday(body);
      setResult(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Couldn't generate today's look");
    } finally {
      setLoading(false);
    }
  }, [coords]);

  const saveLook = async () => {
    if (!result?.look) return;
    setSaving(true);
    try {
      await outfitsAPI.create({
        name: result.look.name,
        items: result.look.items.map((i) => ({ item: i._id, type: catToType[i.category] || 'top' })),
        season: result.weather?.season || 'all-season',
        occasion: 'everyday',
        style: 'casual',
        timeOfDay: result.weather?.timeOfDay || 'both',
        weather: result.weather
          ? { tempC: result.weather.tempC, condition: result.weather.condition, city: result.weather.city }
          : undefined,
      });
      toast.success('Saved to your outfits');
    } catch (error) {
      toast.error('Could not save look');
    } finally {
      setSaving(false);
    }
  };

  const weather = result?.weather;
  const wv = conditionVisual(weather?.condition);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <p className="text-sm text-neon-green/70 font-medium uppercase tracking-[0.2em] mb-1">{todayLabel()}</p>
          <h1 className="text-4xl font-display font-bold text-white leading-none">Today's Appearance</h1>
          <p className="text-gray-500 mt-2">A look picked for the weather, your style, and pieces you rarely wear.</p>
        </div>

        {/* Weather chip */}
        {weather && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black-700/60 border border-gray-700/60">
            <wv.Icon className={`w-7 h-7 ${wv.tint}`} />
            <div className="leading-tight">
              {weather.tempC != null ? (
                <p className="text-xl font-bold text-white">{weather.tempC}°<span className="text-sm text-gray-400">C</span></p>
              ) : (
                <p className="text-sm font-semibold text-gray-300 capitalize">{weather.season}</p>
              )}
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                {weather.city && <><MapPin className="w-3 h-3" />{weather.city} · </>}
                <span className="capitalize">{weather.condition || weather.season}</span>
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Location hint */}
      {geoState === 'denied' && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-black-700/40 border border-gray-800 rounded-lg px-3 py-2">
          <ThermometerSun className="w-4 h-4" />
          Location is off, so the look uses the current season instead of live weather. Enable location for weather-aware picks.
        </div>
      )}

      {/* Empty / CTA state */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-green/5 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-neon-green" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Ready when you are</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Generate a complete look styled for {geoState === 'ready' ? "today's weather" : 'the season'} and built
            around clothes that deserve more wear.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={generate}
            disabled={loading || geoState === 'pending'}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Wand2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Styling your look…' : geoState === 'pending' ? 'Getting location…' : "Generate Today's Look"}
          </motion.button>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence mode="wait">
        {result?.look && (
          <motion.div
            key={result.look.name + (result.look.items?.[0]?._id || '')}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Hero look */}
            <div className="grid md:grid-cols-2 gap-6 card p-0 overflow-hidden">
              {/* Collage */}
              <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[440px] bg-black-800">
                <LookCollage items={result.look.items} large />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-neon-green/40">
                  {weather?.timeOfDay === 'night'
                    ? <Moon className="w-4 h-4 text-indigo-300" />
                    : <Sun className="w-4 h-4 text-yellow-400" />}
                  <span className="text-xs text-gray-200 capitalize">{weather?.timeOfDay} look</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 flex flex-col">
                <span className="text-xs text-neon-green/70 uppercase tracking-[0.2em] mb-1">Look of the day</span>
                <h2 className="text-3xl font-display font-bold text-white leading-tight mb-3">{result.look.name}</h2>

                {result.look.why?.length > 0 && (
                  <ul className="space-y-1.5 mb-5">
                    {result.look.why.slice(0, 4).map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <Sparkles className="w-3.5 h-3.5 text-neon-green mt-0.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Pieces */}
                <div className="space-y-2 mb-6">
                  {result.look.items.map((it) => (
                    <div
                      key={it._id}
                      onClick={() => navigate(`/wardrobe/${it._id}`)}
                      className="flex items-center gap-3 p-2 rounded-lg bg-black-700/50 hover:bg-black-700 border border-transparent hover:border-neon-green/30 transition-all cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-md overflow-hidden bg-black-800 flex-shrink-0">
                        {getImageUrl(it.image) ? (
                          <img src={getImageUrl(it.image)} alt={it.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Shirt className="w-4 h-4 text-gray-600" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{it.name}</p>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wide">{it.category}</p>
                      </div>
                      {it.wearCount === 0 && (
                        <span className="text-[10px] text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full">New rotation</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={generate}
                    disabled={loading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Shuffle
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={saveLook}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save Look'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Alternates */}
            {result.alternates?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Other options</h3>
                <div className="grid grid-cols-2 gap-4">
                  {result.alternates.map((alt, i) => (
                    <div key={i} className="card p-0 overflow-hidden group">
                      <div className="aspect-[3/2] bg-black-800 overflow-hidden">
                        <LookCollage items={alt.items} />
                      </div>
                      <div className="p-3">
                        <p className="font-display font-bold text-white text-sm truncate">{alt.name}</p>
                        <p className="text-[11px] text-gray-500">{alt.items.length} pieces</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodaysAppearance;
