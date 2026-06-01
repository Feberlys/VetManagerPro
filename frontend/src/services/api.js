import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // La URL de tu servidor Node
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