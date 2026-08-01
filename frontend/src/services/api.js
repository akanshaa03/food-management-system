import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Axios HTTP Client Instance configured with base URL and Request/Response Interceptors
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle API errors gracefully without clearing user session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Endpoint Response Notice:', error?.response?.status, error?.message);
    return Promise.reject(error);
  }
);

export default api;
