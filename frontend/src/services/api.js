import axios from 'axios';

const isVercelDeployment = window.location.hostname.endsWith('.vercel.app');

let baseURL = isVercelDeployment ? '/api' : (process.env.REACT_APP_API_URL || '');

if (!baseURL) {
    baseURL = `http://${window.location.hostname}:5001/api`;
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
