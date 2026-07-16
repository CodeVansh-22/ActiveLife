import axios from 'axios';

const FALLBACK_RENDER_API_URL = 'https://activelife-backend.onrender.com/api';
const BLOCKED_API_HOSTS = ['activelife.onrender.com'];

let baseURL = process.env.REACT_APP_API_URL || '';

try {
    const configuredUrl = baseURL ? new URL(baseURL) : null;
    if (configuredUrl && BLOCKED_API_HOSTS.includes(configuredUrl.hostname)) {
        baseURL = FALLBACK_RENDER_API_URL;
    }
} catch (error) {
    baseURL = '';
}

if (!baseURL) {
    baseURL = window.location.hostname.endsWith('.vercel.app')
        ? FALLBACK_RENDER_API_URL
        : `http://${window.location.hostname}:5001/api`;
}

if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL: baseURL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
