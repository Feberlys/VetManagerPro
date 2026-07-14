import axios from 'axios';

// Determinar la URL base según el entorno
const getBaseURL = () => {
    // En producción: usa la variable de entorno o la URL de Render del backend
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_URL || 'https://vetmanagerpro.onrender.com/api';
    }
    // En desarrollo: localhost
    return 'http://localhost:3000';
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 10000,
});

// Interceptor: Antes de que salga cualquier petición, le pega el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
