import axios from 'axios';

const api = axios.create({
    // Automatically use the host IP (e.g., 192.168.x.x) if accessed via LAN
    baseURL: `http://${window.location.hostname}:5001/api`,
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