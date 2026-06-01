import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';

// Un componente rápido para proteger rutas
const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useContext(AuthContext);
    
    if (cargando) return <div>Cargando...</div>;
    if (!usuario) return <Navigate to="/" />;
    
    return children;
};

// Un Dashboard temporal para confirmar que entramos
const Dashboard = () => {
    const { usuario, logout } = useContext(AuthContext);
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">¡Bienvenida al sistema, {usuario?.nombreCompleto}!</h1>
            <p className="mt-2 text-gray-600">Rol ID: {usuario?.rolId}</p>
            <button 
                onClick={logout} 
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública */}
                <Route path="/" element={<Login />} />

                {/* Rutas privadas (El resto de los módulos irán aquí adentro) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <RutaProtegida>
                            <Dashboard />
                        </RutaProtegida>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;