import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('usuario');
        
        if (token && user && user !== "undefined") {
            try {
                // Bloque defensivo restaurado
                setUsuario(JSON.parse(user)); 
            } catch (error) {
                console.error("Localstorage corrupto, limpiando...", error);
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
            }
        }
        setCargando(false);
    }, []);

    const login = async (correo, password) => {
        try {
            // Nota: Mantuve tu ruta original, pero asegúrate de que no cause /api/api
            const response = await api.post('/api/auth/login', { correo, password }, { headers: { 'Content-Type': 'application/json' } });
            const { token, usuario } = response.data;

            // EL ESCUDO: Si el backend no manda usuario, bloqueamos el acceso.
            if (!usuario) {
                console.error("El backend no envió el objeto 'usuario'.");
                return { success: false, error: "Faltan datos de usuario en la respuesta del servidor" };
            }

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