import axios from 'axios';

const BASE_URL = 'http://localhost:5127/api';

const baseApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 Inject token dynamically before every request
baseApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");
    const distributorToken = localStorage.getItem("token");
    const token = adminToken || distributorToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default baseApi;
