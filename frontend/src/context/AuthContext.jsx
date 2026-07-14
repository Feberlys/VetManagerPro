import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Revisar si ya hay una sesión guardada al abrir la app
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('usuario');
        if (token && user) {
            setUsuario(JSON.parse(user));
        }
        setCargando(false);
    }, []);

    const login = async (correo, password) => {
        try {
            const response = await api.post('/api/auth/login', { correo, password },{headers: { 'Content-Type': 'application/json' }});
            const { token, usuario } = response.data;

            // Guardar en el navegador
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            setUsuario(usuario);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
            {children}
        </AuthContext.Provider>
    );
};