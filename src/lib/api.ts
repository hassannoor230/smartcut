import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://smartcut-bd-one.vercel.app/api'
);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handled by auth context / protected routes
    }
    return Promise.reject(error);
  }
);

export default api;
