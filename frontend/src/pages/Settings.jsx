import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Shirt,
  Calendar,
  X,
  Check,
  Trash2,
  Ruler,
} from 'lucide-react';
import { usersAPI } from '@/services/api';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';
import { STYLES, SEASONS, COLORS } from '@/constants/taxonomy';

const styleOptions = STYLES;
const seasonOptions = SEASONS.filter(s => s.value !== 'all-season').map(s => s.value);
const colorOptions = COLORS;

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = React.useState({
    stylePreferences: [],
    preferredColors: [],
    avoidColors: [],
    seasons: [],
    bodyProfile: { skinUndertone: '', fitPreference: '', sizes: { top: '', bottom: '', shoe: '' } },
  });

  // Fetch preferences
  useQuery(
    'user-preferences',
    () => usersAPI.getPreferences(),
    {
      enabled: !!localStorage.getItem('wardrobe-ai-storage'),
      onSuccess: (data) => {
        const prefs = data.data.preferences || {};
        setPreferences({
          stylePreferences: prefs.stylePreferences || [],
          preferredColors: prefs.preferredColors || [],
          avoidColors: prefs.avoidColors || [],
          seasons: prefs.seasons || [],
          bodyProfile: prefs.bodyProfile || { skinUndertone: '', fitPreference: '', sizes: { top: '', bottom: '', shoe: '' } },
        });
      },
    }
  );

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(
    (data) => usersAPI.updatePreferences(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-preferences');
        toast.success('Preferences saved!');
      },
      onError: () => {
        toast.error('Failed to save preferences');
      },
    }
  );

  // Delete account mutation
  const deleteAccountMutation = useMutation(
    () => usersAPI.deleteAccount(),
    {
      onSuccess: () => {
        localStorage.removeItem('wardrobe-ai-storage');
        navigate('/register');
        toast.success('Account deleted');
      },
      onError: () => {
        toast.error('Failed to delete account');
      },
    }
  );

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const handleLogout = () => {
    const { logout } = useStore.getState();
    logout();
    navigate('/login');
  };

  const toggleStyle = (style) => {
    setPreferences(prev => ({
      ...prev,
      stylePreferences: prev.stylePreferences.includes(style)
        ? prev.stylePreferences.filter(s => s !== style)
        : [...prev.stylePreferences, style]
    }));
  };

  const togglePreferredColor = (color) => {
    setPreferences(prev => ({
      ...prev,
      preferredColors: prev.preferredColors.includes(color)
        ? prev.preferredColors.filter(c => c !== color)
        : [...prev.preferredColors, color]
    }));
  };

  const toggleAvoidColor = (color) => {
    setPreferences(prev => ({
      ...prev,
      avoidColors: prev.avoidColors.includes(color)
        ? prev.avoidColors.filter(c => c !== color)
        : [...prev.avoidColors, color]
    }));
  };

  const toggleSeason = (season) => {
    setPreferences(prev => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter(s => s !== season)
        : [...prev.seasons, season]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-green/5">
          <SettingsIcon className="w-6 h-6 text-neon-green" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
          <p className="text-gray-400">Customize your StyleAI experience</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-green to-neon-greenLight flex items-center justify-center">
                <User className="w-8 h-8 text-black-800" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-neon-green/20 text-neon-green capitalize">
                  {user?.subscription?.plan || 'Free'} Plan
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePreferences}
                disabled={updatePreferencesMutation.isLoading}
                className="flex-1 btn-primary"
              >
                {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="px-6 py-3 rounded-lg border-2 border-gray-700 text-gray-300 hover:border-neon-green hover:text-neon-green transition-all"
              >
                Logout
              </motion.button>
            </div>
          </motion.div>

          {/* Style Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Shirt className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Style Preferences</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <motion.button
                  key={style}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleStyle(style)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    preferences.stylePreferences.includes(style)
                      ? 'bg-neon-green text-black-800 font-medium'
                      : 'bg-black-600 text-gray-300 hover:bg-black-500'
                  }`}
                >
                  {style}
                  {preferences.stylePreferences.includes(style) && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Color Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Palette className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Color Preferences</h2>
            </div>

            {/* Preferred Colors */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Preferred Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => togglePreferredColor(color)}
                    className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                      preferences.preferredColors.includes(color)
                        ? 'border-neon-green shadow-neon-sm'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {preferences.preferredColors.includes(color) && (
                      <Check className="absolute inset-0 m-auto w-4 h-4 text-white mix-blend-difference" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Avoid Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Colors to Avoid</h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleAvoidColor(color)}
                    className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                      preferences.avoidColors.includes(color)
                        ? 'border-red-500 shadow-neon-sm'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {preferences.avoidColors.includes(color) && (
                      <X className="absolute inset-0 m-auto w-4 h-4 text-white mix-blend-difference" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Season Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Active Seasons</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {seasonOptions.map((season) => (
                <motion.button
                  key={season}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSeason(season)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    preferences.seasons.includes(season)
                      ? 'bg-neon-green/20 border-2 border-neon-green text-neon-green'
                      : 'bg-black-600 border-2 border-transparent text-gray-300'
                  }`}
                >
                  {season}
                  {preferences.seasons.includes(season) && (
                    <Check className="w-4 h-4" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Body & Fit Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-neon-green/10">
                <Ruler className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Body & Fit</h2>
                <p className="text-xs text-gray-500 mt-0.5">Personalizes outfit & match recommendations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Skin Undertone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skin Undertone</label>
                <div className="flex gap-2">
                  {['warm', 'cool', 'neutral'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferences(p => ({ ...p, bodyProfile: { ...p.bodyProfile, skinUndertone: p.bodyProfile?.skinUndertone === t ? '' : t } }))}
                      className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all border ${
                        preferences.bodyProfile?.skinUndertone === t
                          ? 'bg-neon-green/20 border-neon-green text-neon-green font-medium'
                          : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fit Preference</label>
                <div className="flex gap-2">
                  {['slim', 'regular', 'relaxed'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPreferences(p => ({ ...p, bodyProfile: { ...p.bodyProfile, fitPreference: p.bodyProfile?.fitPreference === f ? '' : f } }))}
                      className={`flex-1 py-2 rounded-lg text-sm capitalize transition-all border ${
                        preferences.bodyProfile?.fitPreference === f
                          ? 'bg-neon-green/20 border-neon-green text-neon-green font-medium'
                          : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Top Size</label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL"
                  value={preferences.bodyProfile?.sizes?.top || ''}
                  onChange={e => setPreferences(p => ({ ...p, bodyProfile: { ...p.bodyProfile, sizes: { ...p.bodyProfile?.sizes, top: e.target.value } } }))}
                  className="input-primary w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bottom Size</label>
                <input
                  type="text"
                  placeholder="e.g. 30x32, M"
                  value={preferences.bodyProfile?.sizes?.bottom || ''}
                  onChange={e => setPreferences(p => ({ ...p, bodyProfile: { ...p.bodyProfile, sizes: { ...p.bodyProfile?.sizes, bottom: e.target.value } } }))}
                  className="input-primary w-full"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Shoe Size</label>
                <input
                  type="text"
                  placeholder="e.g. US 10, EU 43"
                  value={preferences.bodyProfile?.sizes?.shoe || ''}
                  onChange={e => setPreferences(p => ({ ...p, bodyProfile: { ...p.bodyProfile, sizes: { ...p.bodyProfile?.sizes, shoe: e.target.value } } }))}
                  className="input-primary w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card p-6 border-2 border-red-500/30">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  deleteAccountMutation.mutate();
                }
              }}
              disabled={deleteAccountMutation.isLoading}
              className="w-full py-3 rounded-lg bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              {deleteAccountMutation.isLoading ? 'Deleting...' : 'Delete Account'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
