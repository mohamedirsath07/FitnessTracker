/**
 * ============================================
 * API SERVICE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * WHAT IS AXIOS?
 * Axios is a popular HTTP client library for making API requests.
 * It's easier to use than the native fetch() API and has features like:
 * - Automatic JSON parsing
 * - Request/response interceptors
 * - Easy error handling
 * 
 * WHY CREATE AN API SERVICE?
 * - Centralized configuration (base URL, headers)
 * - Consistent error handling
 * - Easy to add/modify API calls
 * - Keeps components clean
 */

import axios from 'axios';

// Create axios instance with default config
// In production, uses VITE_API_URL environment variable
// In development, uses proxy configured in vite.config.js
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * REQUEST INTERCEPTOR
 * 
 * Runs before every request is sent.
 * We use it to attach the JWT token to protected requests.
 */
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (token) {
            // Add Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * RESPONSE INTERCEPTOR
 * 
 * Runs after every response is received.
 * We use it for global error handling.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Unauthorized) globally
        if (error.response?.status === 401) {
            // Token expired or invalid - logout user
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// AUTH API
// ============================================

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
};

// ============================================
// USER API
// ============================================

export const userAPI = {
    updateProfile: (data) => api.put('/users/profile', data),
    getStats: () => api.get('/users/stats'),
    getLeaderboard: () => api.get('/users/leaderboard'),
};

// ============================================
// WORKOUT API
// ============================================

export const workoutAPI = {
    getAll: (params) => api.get('/workouts', { params }),
    create: (data) => api.post('/workouts', data),
    delete: (id) => api.delete(`/workouts/${id}`),
    getTypes: () => api.get('/workouts/types'),
    getSummary: () => api.get('/workouts/summary'),
};

// ============================================
// MEAL API
// ============================================

export const mealAPI = {
    getAll: (params) => api.get('/meals', { params }),
    create: (data) => api.post('/meals', data),
    delete: (id) => api.delete(`/meals/${id}`),
    getToday: () => api.get('/meals/today'),
    getWeekly: () => api.get('/meals/weekly'),
};

// ============================================
// PROGRESS API
// ============================================

export const progressAPI = {
    getHistory: (days) => api.get('/progress', { params: { days } }),
    getToday: () => api.get('/progress/today'),
    getWeightHistory: (days) => api.get('/progress/weight', { params: { days } }),
    updateWeight: (weight) => api.put('/progress/weight', { weight }),
    getSummary: (period) => api.get('/progress/summary', { params: { period } }),
};

export default api;
