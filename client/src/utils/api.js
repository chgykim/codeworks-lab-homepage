import axios from 'axios';

// API base URL - use Render server in production
const API_BASE_URL = import.meta.env.PROD
    ? 'https://codeworks-lab-homepage.onrender.com/api'
    : '/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage if exists
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error codes
            if (error.response.status === 401) {
                // Clear auth data on unauthorized
                localStorage.removeItem('authToken');
                // Redirect to login if on admin page
                if (window.location.pathname.startsWith('/admin') &&
                    window.location.pathname !== '/admin/login') {
                    window.location.href = '/admin/login';
                }
            }

            if (error.response.status === 429) {
                // Rate limit exceeded
                console.warn('Rate limit exceeded. Please wait before trying again.');
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    firebaseLogin: (idToken) => api.post('/auth/firebase-login', { idToken }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    refreshToken: () => api.post('/auth/refresh')
};

// Reviews API
export const reviewsAPI = {
    getAll: (page = 1, limit = 10) => api.get(`/reviews?page=${page}&limit=${limit}`),
    getStats: () => api.get('/reviews/stats'),
    getById: (id) => api.get(`/reviews/${id}`),
    create: (data) => api.post('/reviews', data)
};

// Blog API
export const blogAPI = {
    getAll: (page = 1, limit = 10, category = '') =>
        api.get(`/blog?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}`),
    getCategories: () => api.get('/blog/categories'),
    getBySlug: (slug) => api.get(`/blog/${slug}`)
};

// Contact API
export const contactAPI = {
    submit: (data) => api.post('/contact', data),
    getInfo: () => api.get('/contact/info')
};

// Settings API
export const settingsAPI = {
    getPublic: () => api.get('/settings/public')
};

// Admin API
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),

    // Reviews
    getReviews: (page = 1, limit = 20, status = '') =>
        api.get(`/admin/reviews?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
    updateReviewStatus: (id, status) => api.put(`/admin/reviews/${id}/status`, { status }),
    deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

    // Blog
    getBlogPosts: (page = 1, limit = 20, status = '') =>
        api.get(`/admin/blog?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
    getBlogPost: (id) => api.get(`/admin/blog/${id}`),
    createBlogPost: (data) => api.post('/admin/blog', data),
    updateBlogPost: (id, data) => api.put(`/admin/blog/${id}`, data),
    deleteBlogPost: (id) => api.delete(`/admin/blog/${id}`),

    // Settings
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (settings) => api.put('/admin/settings', { settings }),

    // Apps (release status)
    getApps: () => api.get('/settings/apps'),
    updateApps: (releasedApps) => api.put('/settings/apps', { releasedApps }),

    // Contacts
    getContacts: (page = 1, limit = 20, status = '') =>
        api.get(`/admin/contacts?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
    updateContactStatus: (id, status) => api.put(`/admin/contacts/${id}/status`, { status })
};

export default api;
