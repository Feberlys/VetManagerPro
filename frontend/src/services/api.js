import axios from 'axios';

// Determinar la URL base según el entorno
const normalizeBaseURL = (url = '') => {
    return url
        .trim()
        .replace(/\/+$|^\s+|\s+$/g, '')
        .replace(/\/api$/i, '');
};

const getBaseURL = () => {
    const configuredUrl = import.meta.env.VITE_API_URL;

    if (configuredUrl) {
        return normalizeBaseURL(configuredUrl);
    }

    return import.meta.env.PROD
        ? 'https://vetmanagerpro.onrender.com'
        : 'http://localhost:3000';
};

const api = axios.create({
    baseURL: 'https://vetmanagerpro.onrender.com/api',
});

// Interceptor: Antes de que salga cualquier petición, le pega el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.baseURL && config.url) {
        config.baseURL = config.baseURL.replace(/\/+$/g, '');
        config.url = config.url.replace(/^\/*/g, '/');

        if (config.baseURL.endsWith('/api') && config.url.startsWith('/api')) {
            config.url = config.url.replace(/^\/api/, '');
        }

        config.url = config.url.replace(/\/+/g, '/');
    }

    console.log('🔵 Petición:', config.method.toUpperCase(), config.baseURL + config.url);
    return config;
}, (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
});

// Interceptor de respuesta para debugging
api.interceptors.response.use(
    (response) => {
        console.log('✅ Respuesta:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Error de respuesta:', error.response?.status, error.config?.url);
        if (error.response?.status === 404) {
            console.error('⚠️ RUTA NO ENCONTRADA:', error.config?.url);
        }
        return Promise.reject(error);
    }
);

export default api;
