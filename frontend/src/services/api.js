import axios from 'axios';

const api = axios.create({
    // VITE_API_URL es para la nube. Si no existe, usa localhost.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', 
});

// Interceptor: Antes de que salga cualquier petición, le pega el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;