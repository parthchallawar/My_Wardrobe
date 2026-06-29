import axios from 'axios';

// Helper function to create FormData for uploads
const createFormData = (data, file) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('style', data.style);
  formData.append('color', data.color);
  if (data.brand) formData.append('brand', data.brand);
  if (data.season) formData.append('season', data.season);
  if (data.tags) formData.append('tags', data.tags);
  if (data.aiData) formData.append('aiData', typeof data.aiData === 'string' ? data.aiData : JSON.stringify(data.aiData));
  if (file) formData.append('image', file);
  return formData;
};

// Helper function to create FormData for multiple image uploads
const createFormDataMultiple = (data, files) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('style', data.style);
  formData.append('color', data.color);
  if (data.brand) formData.append('brand', data.brand);
  if (data.season) formData.append('season', data.season);
  if (data.tags) formData.append('tags', data.tags);
  if (data.aiData) formData.append('aiData', typeof data.aiData === 'string' ? data.aiData : JSON.stringify(data.aiData));
  if (files && files.length > 0) {
    files.forEach((file, index) => {
      formData.append('images', file);
    });
  }
  return formData;
};

// Helper function to get full image URL (Cloudinary URLs don't need transformation)
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${API_BASE_URL}${imageUrl}`;
};

/**
 * Returns the best thumbnail URL for an item — prefers the Cloudinary thumbnail,
 * falls back to the full image. Used in list/grid views to avoid loading full images.
 */
export const getThumbUrl = (item) => {
  if (!item) return null;
  const thumb = item.images?.[0]?.thumbnailUrl || item.images?.[0]?.url || item.imageUrl || item.imageBase64;
  return getImageUrl(thumb);
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wardrobe-ai-storage')
      ? JSON.parse(localStorage.getItem('wardrobe-ai-storage')).state?.token
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (let axios set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem('wardrobe-ai-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  createWithImage: (data, file) => {
    const formData = createFormData(data, file);
    return api.post('/items/with-image', formData);
  },
  createWithImages: (data, files) => {
    const formData = createFormDataMultiple(data, files);
    return api.post('/items/with-images', formData);
  },
  update: (id, data) => api.put(`/items/${id}`, data),
  updateWithImage: (id, data, file) => {
    const formData = createFormData(data, file);
    return api.put(`/items/${id}/with-image`, formData);
  },
  updateWithImages: (id, data, files) => {
    const formData = createFormDataMultiple(data, files);
    return api.put(`/items/${id}/with-images`, formData);
  },
  delete: (id) => api.delete(`/items/${id}`),
  toggleFavorite: (id) => api.post(`/items/${id}/favorite`),
  recordWear: (id) => api.post(`/items/${id}/wear`),
  getStatistics: () => api.get('/items/statistics/summary'),
};

// Outfits API
export const outfitsAPI = {
  getAll: (params) => api.get('/outfits', { params }),
  getById: (id) => api.get(`/outfits/${id}`),
  create: (data) => api.post('/outfits', data),
  update: (id, data) => api.put(`/outfits/${id}`, data),
  delete: (id) => api.delete(`/outfits/${id}`),
  toggleFavorite: (id) => api.post(`/outfits/${id}/favorite`),
  recordWear: (id) => api.post(`/outfits/${id}/wear`),
  generate: (data) => api.post('/outfits/generate', data),
  generateToday: (data) => api.post('/outfits/today', data),
};

// AI API
export const aiAPI = {
  shopMatch: (data) => api.post('/ai/shop-match', data),
  matchItems: (data) => api.post('/ai/match-items', data),
  analyzeOutfits: (data) => api.post('/ai/analyze-outfits', data),
  getStyleInsights: () => api.get('/ai/style-insights'),
  recommendPurchases: (data) => api.post('/ai/recommend-purchases', data),
  getColors: () => api.get('/ai/colors'),
  getSeasonalGuide: () => api.get('/ai/seasonal-guide'),
  analyzeImage: (formData) => api.post('/analyze', formData),
};

// Users API
export const usersAPI = {
  updatePreferences: (data) => api.put('/users/preferences', data),
  getPreferences: () => api.get('/users/preferences'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteAccount: () => api.delete('/users/account'),
};

// WearLog API
export const wearLogAPI = {
  log: (data) => api.post('/wearlog', data),
  getRange: (params) => api.get('/wearlog', { params }),
  getRotation: (params) => api.get('/wearlog/rotation', { params }),
  delete: (id) => api.delete(`/wearlog/${id}`),
};

export default api;
