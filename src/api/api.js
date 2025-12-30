import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hcctrichy.ac.in/phyto-drug-finder-main/backend/api/';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('phyto_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('phyto_token');
      localStorage.removeItem('phyto_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  login: (credentials) => api.post('/auth/login.php', credentials),
  register: (userData) => api.post('/auth/register.php', userData),
  logout: () => api.post('/auth/logout.php'),
  check: () => api.get('/auth/check.php'),
  getProfile: () => api.get('/auth/profile.php'),
  updateProfile: (data) => api.post('/auth/update-profile.php', data),
  changePassword: (data) => api.post('/auth/change-password.php', data),
};

// ==================== PLANTS APIs ====================
export const plantsAPI = {
  list: (params = {}) => api.get('/plants/list.php', { params }),
  get: (id) => api.get('/plants/get.php', { params: { id } }),
  getBySlug: (slug) => api.get('/plants/get-by-slug.php', { params: { slug } }),
  search: (query, params = {}) => api.get('/plants/search.php', { params: { query, ...params } }),
  featured: () => api.get('/plants/featured.php'),
  stats: () => api.get('/plants/stats.php'),
  families: () => api.get('/plants/families.php'),
  byFamily: (family) => api.get('/plants/by-family.php', { params: { family } }),
  add: (data) => api.post('/plants/add.php', data),
  update: (data) => api.post('/plants/update.php', data),
  delete: (id) => api.post('/plants/delete.php', { id }),
};

// ==================== COMPOUNDS APIs ====================
export const compoundsAPI = {
  list: (params = {}) => api.get('/compounds/list.php', { params }),
  get: (id) => api.get('/compounds/get.php', { params: { id } }),
  byPlant: (plantId) => api.get('/compounds/by-plant.php', { params: { plant_id: plantId } }),
  search: (query) => api.get('/compounds/search.php', { params: { query } }),
  similar: (compoundId) => api.get('/compounds/similar.php', { params: { compound_id: compoundId } }),
  byActivity: (activity) => api.get('/compounds/by-activity.php', { params: { activity } }),
  stats: () => api.get('/compounds/stats.php'),
  add: (data) => api.post('/compounds/add.php', data),
  update: (data) => api.post('/compounds/update.php', data),
  delete: (id) => api.post('/compounds/delete.php', { id }),
  linkPlant: (compoundId, plantId) => api.post('/compounds/link-plant.php', { compound_id: compoundId, plant_id: plantId }),
  unlinkPlant: (compoundId, plantId) => api.post('/compounds/unlink-plant.php', { compound_id: compoundId, plant_id: plantId }),
};

// ==================== MEDICINAL USES APIs ====================
export const medicinalAPI = {
  list: () => api.get('/medicinal-uses/list.php'),
  byPlant: (plantId) => api.get('/medicinal-uses/by-plant.php', { params: { plant_id: plantId } }),
  add: (data) => api.post('/medicinal-uses/add.php', data),
  update: (data) => api.post('/medicinal-uses/update.php', data),
  delete: (id) => api.post('/medicinal-uses/delete.php', { id }),
};

// ==================== SAFETY APIs ====================
export const safetyAPI = {
  byPlant: (plantId) => api.get('/safety/by-plant.php', { params: { plant_id: plantId } }),
  save: (data) => api.post('/safety/save.php', data),
  delete: (plantId) => api.post('/safety/delete.php', { plant_id: plantId }),
};

// ==================== DRUG-LIKENESS APIs ====================
export const drugLikenessAPI = {
  byPlant: (plantId) => api.get('/drug-likeness/by-plant.php', { params: { plant_id: plantId } }),
  byCompound: (compoundId) => api.get('/drug-likeness/by-compound.php', { params: { compound_id: compoundId } }),
  save: (data) => api.post('/drug-likeness/save.php', data),
};

// ==================== ECOLOGY APIs ====================
export const ecologyAPI = {
  byPlant: (plantId) => api.get('/ecology/by-plant.php', { params: { plant_id: plantId } }),
  save: (data) => api.post('/ecology/save.php', data),
  regions: () => api.get('/ecology/regions.php'),
  byRegion: (region) => api.get('/ecology/by-region.php', { params: { region } }),
};

// ==================== CULTURAL USES APIs ====================
export const culturalAPI = {
  byPlant: (plantId) => api.get('/cultural-uses/by-plant.php', { params: { plant_id: plantId } }),
  bySystem: (system) => api.get('/cultural-uses/by-system.php', { params: { system } }),
  add: (data) => api.post('/cultural-uses/add.php', data),
  update: (data) => api.post('/cultural-uses/update.php', data),
  delete: (id) => api.post('/cultural-uses/delete.php', { id }),
};

// ==================== CASE STUDIES APIs ====================
export const caseStudiesAPI = {
  list: (params = {}) => api.get('/case-studies/list.php', { params }),
  get: (id) => api.get('/case-studies/get.php', { params: { id } }),
  byPlant: (plantId) => api.get('/case-studies/by-plant.php', { params: { plant_id: plantId } }),
  search: (query) => api.get('/case-studies/search.php', { params: { query } }),
  submit: (formData) => api.post('/case-studies/submit.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  mySubmissions: () => api.get('/case-studies/my-submissions.php'),
  stats: () => api.get('/case-studies/stats.php'),
  pending: () => api.get('/case-studies/pending.php'),
  approve: (id) => api.post('/case-studies/approve.php', { id }),
  reject: (id, reason) => api.post('/case-studies/reject.php', { id, reason }),
  delete: (id) => api.post('/case-studies/delete.php', { id }),
  download: (id) => api.get('/case-studies/download.php', { params: { id }, responseType: 'blob' }),
};

// ==================== IMAGES APIs ====================
export const imagesAPI = {
  list: (params = {}) => api.get('/images/list.php', { params }),
  get: (id) => api.get('/images/get.php', { params: { id } }),
  byPlant: (plantId) => api.get('/images/by-plant.php', { params: { plant_id: plantId } }),
  byCategory: (category) => api.get('/images/by-category.php', { params: { category } }),
  categories: () => api.get('/images/categories.php'),
  upload: (formData) => api.post('/images/upload.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  myUploads: () => api.get('/images/my-uploads.php'),
  pending: () => api.get('/images/pending.php'),
  approve: (id) => api.post('/images/approve.php', { id }),
  reject: (id, reason) => api.post('/images/reject.php', { id, reason }),
  delete: (id) => api.post('/images/delete.php', { id }),
};

// ==================== FEEDBACK APIs ====================
export const feedbackAPI = {
  submit: (data) => api.post('/feedback/submit.php', data),
  types: () => api.get('/feedback/types.php'),
  list: (params = {}) => api.get('/feedback/list.php', { params }),
  get: (id) => api.get('/feedback/get.php', { params: { id } }),
  unread: () => api.get('/feedback/unread.php'),
  reply: (id, message) => api.post('/feedback/reply.php', { id, message }),
  markRead: (id) => api.post('/feedback/mark-read.php', { id }),
  delete: (id) => api.post('/feedback/delete.php', { id }),
  stats: () => api.get('/feedback/stats.php'),
};

// ==================== STATS APIs ====================
export const statsAPI = {
  home: () => api.get('/stats/home.php'),
  dashboard: () => api.get('/stats/dashboard.php'),
  activity: (params = {}) => api.get('/stats/activity.php', { params }),
  users: () => api.get('/stats/users.php'),
  content: () => api.get('/stats/content.php'),
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  usersList: (params = {}) => api.get('/admin/users/list.php', { params }),
  getUser: (id) => api.get('/admin/users/get.php', { params: { id } }),
  updateRole: (id, role) => api.post('/admin/users/update-role.php', { id, role }),
  toggleStatus: (id) => api.post('/admin/users/toggle-status.php', { id }),
  deleteUser: (id) => api.post('/admin/users/delete.php', { id }),
};

// ==================== BOOKMARKS APIs ====================
export const bookmarksAPI = {
  list: () => api.get('/bookmarks/list.php'),
  add: (plantId) => api.post('/bookmarks/add.php', { plant_id: plantId }),
  remove: (plantId) => api.post('/bookmarks/remove.php', { plant_id: plantId }),
  check: (plantId) => api.get('/bookmarks/check.php', { params: { plant_id: plantId } }),
};

// ==================== EXPORT APIs ====================
export const exportAPI = {
  plantPDF: (plantId) => api.get('/export/plant-pdf.php', { 
    params: { plant_id: plantId }, 
    responseType: 'blob' 
  }),
  compare: (plantIds) => api.get('/export/compare.php', { 
    params: { plant_ids: plantIds.join(',') }, 
    responseType: 'blob' 
  }),
  citation: (plantId, format = 'apa') => api.get('/export/citation.php', { 
    params: { plant_id: plantId, format } 
  }),
};

// ==================== AUDIO APIs ====================
export const audioAPI = {
  pronunciation: (text) => api.get('/audio/pronunciation.php', { params: { text } }),
};

export default api;