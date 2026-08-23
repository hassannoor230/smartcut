import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://smartcut-bd-one.vercel.app/api'
);

/**
 * Authenticated Axios instance for API requests
 * 
 * HttpOnly Cookie Authentication:
 * - withCredentials: true enables automatic cookie sending with every request
 * - Cookies are set by backend during login (POST /api/admin/login)
 * - Cookies are automatically included in protected route requests
 * - No need to manually add Authorization header (backend uses cookies)
 * 
 * CRITICAL CONFIGURATION:
 * - withCredentials: true (MUST be enabled for cookies)
 * - Backend CORS must have credentials: true
 * - Backend must set proper SameSite/Secure cookie flags
 * 
 * If protected routes return 401:
 * 1. Check browser DevTools → Application → Cookies (token cookie should exist)
 * 2. Check Network tab → Request Headers (should include Cookie header)
 * 3. Verify backend JWT_SECRET is set in Vercel environment
 * 4. Check browser console for CORS errors
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRITICAL: Enable cookie sending with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handled by auth context / protected routes
      // User will be redirected to login page
    }
    return Promise.reject(error);
  }
);

export default api;
