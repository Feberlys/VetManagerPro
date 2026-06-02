import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import GestionUsuarios from './pages/GestionUsuarios'; // <-- Aquí importamos la nueva pantalla

// Componente para proteger rutas
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useContext(AuthContext);
    
    if (cargando) return <div>Cargando...</div>;
    if (!usuario) return <Navigate to="/" />;
    
    return children;
};

// Dashboard actualizado con el botón
const Dashboard = () => {
    const { usuario, logout } = useContext(AuthContext);
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">¡Bienvenida al sistema, {usuario?.nombreCompleto}!</h1>
            <p className="mt-2 text-gray-600">Rol ID: {usuario?.rolId}</p>
            
            <div className="mt-6 space-x-4">
                {/* Botón para ir a la gestión de usuarios (solo visible para admin) */}
                {usuario?.rolId === 1 && (
                    <Link to="/usuarios" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Gestionar Usuarios
                    </Link>
                )}
                
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública */}
                <Route path="/" element={<Login />} />

                {/* Ruta privada: Dashboard */}
                <Route 
                    path="/dashboard" 
                    element={
                        <RutaProtegida>
                            <Dashboard />
                        </RutaProtegida>
                    } 
                />

                {/* Ruta privada: Gestión de Usuarios */}
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