import axios from "axios";

// ===============================================
// CONFIGURATION
// ===============================================
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://hcctrichy.ac.in/phyto-drug-finder-main/backend/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000, // 15 seconds default timeout
});

// ===============================================
// INTERCEPTORS
// ===============================================

// Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("phyto_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling + 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("phyto_token");
      localStorage.removeItem("phyto_user");

      // Avoid redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }

    if (!error.response) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ===============================================
// RESPONSE HELPERS
// ===============================================

const handleResponse = (response) => {
  const resData = response.data;

  // Handle different response structures
  if (!resData) {
    throw new Error("Empty response received");
  }

  // If success flag exists and is false, throw error
  if (resData.success === false) {
    const msg = resData.message || resData.error || "Request failed";
    throw new Error(msg);
  }

  // Extract actual data
  if (resData.plant !== undefined) return resData.plant;
  if (resData.data !== undefined) return resData.data;

  // If success is true or undefined, return the whole response
  return resData;
};

const handleError = (error) => {
  let message = "An error occurred";

  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.message) {
    message = error.message;
  }

  const err = new Error(message);
  err.status = error.response?.status;
  err.data = error.response?.data;
  throw err;
};
// ===============================================
// API GROUPS
// ===============================================

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) =>
    api
      .post("/auth/login.php", credentials)
      .then(handleResponse)
      .catch(handleError),
  register: (userData) =>
    api
      .post("/auth/register.php", userData)
      .then(handleResponse)
      .catch(handleError),
  logout: () => api.post("/auth/logout.php").then(handleResponse),
  check: () => api.get("/auth/check.php").then(handleResponse),
  getProfile: () => api.get("/auth/profile.php").then(handleResponse),
  updateProfile: (data) =>
    api.post("/auth/update-profile.php", data).then(handleResponse),
  changePassword: (data) =>
    api.post("/auth/change-password.php", data).then(handleResponse),
};

// ==================== PLANTS ====================
export const plantsAPI = {
  list: (params = {}) => {
    return api
      .get("/plants/list.php", { params })
      .then((response) => {
        console.log("Plants list raw response:", response);
        // Handle response data inconsistencies
        if (response.data) {
          return {
            data: {
              success: response.data.success || true,
              data: response.data.data || response.data.plants || [],
              total: response.data.total || response.data.data?.length || 0,
              message: response.data.message || "",
            },
          };
        }
        return handleResponse(response);
      })
      .catch((error) => {
        console.error("Plants list error:", error);
        throw error;
      });
  },
  get: (id) =>
    api.get("/plants/get.php", { params: { id } }).then(handleResponse),
  getBySlug: (slug) =>
    api
      .get("/plants/get-by-slug.php", { params: { slug } })
      .then(handleResponse),

  // Updated search method to handle both 'query' and 'q' parameters
  search: (query, params = {}) => {
    const searchParams = {
      query: query, // For PHP API that expects 'query'
      ...params,
    };

    console.log("Search params:", searchParams);

    return api
      .get("/plants/search.php", {
        params: searchParams,
      })
      .then((response) => {

        // Ensure consistent response structure
        if (response.data && response.data.success) {
          return {
            data: {
              success: true,
              data: response.data.data || [],
              message: response.data.message || "",
            },
          };
        }

        return handleResponse(response);
      })
      .catch((error) => {
        console.error("Search API error:", error);
        throw error;
      });
  },

  featured: () => api.get("/plants/featured.php").then(handleResponse),
  stats: () => api.get("/plants/stats.php").then(handleResponse),
  families: () => api.get("/plants/families.php").then(handleResponse),
  byFamily: (family) =>
    api
      .get("/plants/by-family.php", { params: { family } })
      .then(handleResponse),
  add: (data) => api.post("/plants/add.php", data).then(handleResponse),
  update: (data) => api.post("/plants/update.php", data).then(handleResponse),
  delete: (id) => api.post("/plants/delete.php", { id }).then(handleResponse),
};

// ==================== COMPOUNDS ====================
export const compoundsAPI = {
  list: (params = {}) =>
    api.get("/compounds/list.php", { params }).then(handleResponse),
  get: (id) =>
    api.get("/compounds/get.php", { params: { id } }).then(handleResponse),
  byPlant: (plantId) =>
    api
      .get("/compounds/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  search: (query) =>
    api
      .get("/compounds/search.php", { params: { query } })
      .then(handleResponse),
  similar: (compoundId) =>
    api
      .get("/compounds/similar.php", { params: { compound_id: compoundId } })
      .then(handleResponse),
  byActivity: (activity) =>
    api
      .get("/compounds/by-activity.php", { params: { activity } })
      .then(handleResponse),
  stats: () => api.get("/compounds/stats.php").then(handleResponse),
  add: (data) => api.post("/compounds/add.php", data).then(handleResponse),
  update: (data) =>
    api.post("/compounds/update.php", data).then(handleResponse),
  delete: (id) =>
    api.post("/compounds/delete.php", { id }).then(handleResponse),
  linkPlant: (compoundId, plantId) =>
    api
      .post("/compounds/link-plant.php", {
        compound_id: compoundId,
        plant_id: plantId,
      })
      .then(handleResponse),
  unlinkPlant: (compoundId, plantId) =>
    api
      .post("/compounds/unlink-plant.php", {
        compound_id: compoundId,
        plant_id: plantId,
      })
      .then(handleResponse),
};

// ==================== MEDICINAL USES ====================
export const medicinalAPI = {
  list: () => api.get("/medicinal-uses/list.php").then(handleResponse),
  byPlant: (plantId) =>
    api
      .get("/medicinal-uses/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  add: (data) => api.post("/medicinal-uses/add.php", data).then(handleResponse),
  update: (data) =>
    api.post("/medicinal-uses/update.php", data).then(handleResponse),
  delete: (id) =>
    api.post("/medicinal-uses/delete.php", { id }).then(handleResponse),
};

// ==================== SAFETY ====================
export const safetyAPI = {
  byPlant: (plantId) =>
    api
      .get("/safety/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  save: (data) => api.post("/safety/save.php", data).then(handleResponse),
  delete: (plantId) =>
    api.post("/safety/delete.php", { plant_id: plantId }).then(handleResponse),
};

// ==================== DRUG-LIKENESS ====================
export const drugLikenessAPI = {
  byPlant: (plantId) =>
    api
      .get("/drug-likeness/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  byCompound: (compoundId) =>
    api
      .get("/drug-likeness/by-compound.php", {
        params: { compound_id: compoundId },
      })
      .then(handleResponse),
  save: (data) =>
    api.post("/drug-likeness/save.php", data).then(handleResponse),
};

// ==================== ECOLOGY ====================
export const ecologyAPI = {
  byPlant: (plantId) =>
    api
      .get("/ecology/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  save: (data) => api.post("/ecology/save.php", data).then(handleResponse),
  regions: () => api.get("/ecology/regions.php").then(handleResponse),
  byRegion: (region) =>
    api
      .get("/ecology/by-region.php", { params: { region } })
      .then(handleResponse),
};

// ==================== CULTURAL USES ====================
export const culturalAPI = {
  byPlant: (plantId) =>
    api
      .get("/cultural-uses/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  bySystem: (system) =>
    api
      .get("/cultural-uses/by-system.php", { params: { system } })
      .then(handleResponse),
  add: (data) => api.post("/cultural-uses/add.php", data).then(handleResponse),
  update: (data) =>
    api.post("/cultural-uses/update.php", data).then(handleResponse),
  delete: (id) =>
    api.post("/cultural-uses/delete.php", { id }).then(handleResponse),
};

// ==================== CASE STUDIES ====================
export const caseStudiesAPI = {
  list: (params = {}) =>
    api.get("/case-studies/list.php", { params }).then(handleResponse),
  get: (id) =>
    api.get("/case-studies/get.php", { params: { id } }).then(handleResponse),
  byPlant: (plantId) =>
    api
      .get("/case-studies/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  search: (query) =>
    api
      .get("/case-studies/search.php", { params: { query } })
      .then(handleResponse),
  mySubmissions: () =>
    api.get("/case-studies/my-submissions.php").then(handleResponse),
  stats: () => api.get("/case-studies/stats.php").then(handleResponse),
  pending: () => api.get("/case-studies/pending.php").then(handleResponse),
  approve: (id) =>
    api.post("/case-studies/approve.php", { id }).then(handleResponse),
  reject: (id, reason) =>
    api.post("/case-studies/reject.php", { id, reason }).then(handleResponse),
  delete: (id) =>
    api.post("/case-studies/delete.php", { id }).then(handleResponse),

  submit: (formData) =>
    api
      .post("/case-studies/submit.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      })
      .then(handleResponse),

  download: (id) =>
    api.get("/case-studies/download.php", {
      params: { id },
      responseType: "blob",
      timeout: 30000,
    }),
};

// ==================== IMAGES ====================
export const imagesAPI = {
  list: (params = {}) =>
    api.get("/images/list.php", { params }).then(handleResponse),
  get: (id) =>
    api.get("/images/get.php", { params: { id } }).then(handleResponse),
  byPlant: (plantId) =>
    api
      .get("/images/by-plant.php", { params: { plant_id: plantId } })
      .then(handleResponse),
  byCategory: (category) =>
    api
      .get("/images/by-category.php", { params: { category } })
      .then(handleResponse),
  categories: () => api.get("/images/categories.php").then(handleResponse),
  myUploads: () => api.get("/images/my-uploads.php").then(handleResponse),
  pending: () => api.get("/images/pending.php").then(handleResponse),
  approve: (id) => api.post("/images/approve.php", { id }).then(handleResponse),
  reject: (id, reason) =>
    api.post("/images/reject.php", { id, reason }).then(handleResponse),
  delete: (id) => api.post("/images/delete.php", { id }).then(handleResponse),

  upload: (formData) =>
    api
      .post("/images/upload.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000, // 90 seconds for larger images
      })
      .then(handleResponse),
};

// ==================== FEEDBACK ====================
export const feedbackAPI = {
  submit: (data) => api.post("/feedback/submit.php", data).then(handleResponse),
  types: () => api.get("/feedback/types.php").then(handleResponse),
  list: (params = {}) =>
    api.get("/feedback/list.php", { params }).then(handleResponse),
  get: (id) =>
    api.get("/feedback/get.php", { params: { id } }).then(handleResponse),
  unread: () => api.get("/feedback/unread.php").then(handleResponse),
  reply: (id, message) =>
    api.post("/feedback/reply.php", { id, message }).then(handleResponse),
  markRead: (id) =>
    api.post("/feedback/mark-read.php", { id }).then(handleResponse),
  delete: (id) => api.post("/feedback/delete.php", { id }).then(handleResponse),
  stats: () => api.get("/feedback/stats.php").then(handleResponse),
};

// ==================== STATS ====================
export const statsAPI = {
  home: () => api.get("/stats/home.php").then(handleResponse),
  dashboard: () => api.get("/stats/dashboard.php").then(handleResponse),
  activity: (params = {}) =>
    api.get("/stats/activity.php", { params }).then(handleResponse),
  users: () => api.get("/stats/users.php").then(handleResponse),
  content: () => api.get("/stats/content.php").then(handleResponse),
};

// ==================== ADMIN ====================
export const adminAPI = {
  usersList: (params = {}) =>
    api.get("/admin/users/list.php", { params }).then(handleResponse),
  getUser: (id) =>
    api.get("/admin/users/get.php", { params: { id } }).then(handleResponse),
  updateRole: (id, role) =>
    api.post("/admin/users/update-role.php", { id, role }).then(handleResponse),
  toggleStatus: (id) =>
    api.post("/admin/users/toggle-status.php", { id }).then(handleResponse),
  deleteUser: (id) =>
    api.post("/admin/users/delete.php", { id }).then(handleResponse),
};

// ==================== BOOKMARKS ====================
export const bookmarksAPI = {
  list: () => api.get("/bookmarks/list.php").then(handleResponse),
  add: (plantId) =>
    api.post("/bookmarks/add.php", { plant_id: plantId }).then(handleResponse),
  remove: (plantId) =>
    api
      .post("/bookmarks/remove.php", { plant_id: plantId })
      .then(handleResponse),
  check: (plantId) =>
    api
      .get("/bookmarks/check.php", { params: { plant_id: plantId } })
      .then(handleResponse),
};

// ==================== EXPORT ====================
export const exportAPI = {
  plantPDF: (plantId) =>
    api.get("/export/plant-pdf.php", {
      params: { plant_id: plantId },
      responseType: "blob",
      timeout: 30000,
    }),
  compare: (plantIds) =>
    api.get("/export/compare.php", {
      params: { plant_ids: plantIds.join(",") },
      responseType: "blob",
      timeout: 30000,
    }),
  citation: (plantId, format = "apa") =>
    api
      .get("/export/citation.php", { params: { plant_id: plantId, format } })
      .then(handleResponse),
};

// ==================== AUDIO ====================
export const audioAPI = {
  pronunciation: (text) =>
    api.get("/audio/pronunciation.php", { params: { text } }),
};

// ===============================================
export default api;
