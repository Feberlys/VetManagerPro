import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import GestionUsuarios from './pages/GestionUsuarios';
import Layout from './components/Layout'; // <-- Importamos tu nuevo caparazón
import GestionInventario from './pages/GestionInventario';

// Componente para proteger rutas Y envolverlas en el Layout
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useContext(AuthContext);
    
    if (cargando) return <div>Cargando...</div>;
    if (!usuario) return <Navigate to="/" />;
    
    // Si está logueado, lo metemos dentro del Layout
    return <Layout>{children}</Layout>;
};

// Dashboard Limpio (Ya no necesita menú ni botón de logout, el Layout lo hace)
const Dashboard = () => {
    const { usuario } = useContext(AuthContext);
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Hola, {usuario?.nombreCompleto}! 👋</h1>
            <p className="text-gray-500">Bienvenido al panel de control de VetManager Pro.</p>
            
            <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-emerald-800 font-bold mb-2">Resumen del sistema</h3>
                <p className="text-emerald-600 text-sm">Selecciona una opción en el menú lateral para comenzar a trabajar.</p>
            </div>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública (No lleva Layout porque ocupa toda la pantalla) */}
                <Route path="/" element={<Login />} />

                {/* Rutas privadas (Se inyectan dentro del caparazón) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <RutaProtegida>
                            <Dashboard />
                        </RutaProtegida>
                    } 
                />

                <Route 
                    path="/inventario" 
                    element={
                        <RutaProtegida>
                            <GestionInventario />
                        </RutaProtegida>
                    } 
                />

                <Route 
                    path="/usuarios" 
                    element={
                        <RutaProtegida>
                            <GestionUsuarios />
                        </RutaProtegida>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;