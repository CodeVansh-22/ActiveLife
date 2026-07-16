import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5001/api`,
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