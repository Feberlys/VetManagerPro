import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import GestionUsuarios from './pages/GestionUsuarios';
import Layout from './components/Layout';
import GestionInventario from './pages/GestionInventario';
import HistorialMedico from './pages/HistorialMedico';
import GestionClientes from './pages/GestionClientes';
import GestionMascotas from './pages/GestionMascotas';
import GestionCitas from './pages/GestionCitas';
import GestionGuarderia from './pages/GestionGuarderia';
import Dashboard from './pages/Dashboard'; // ¡Aquí importamos el oficial!

const RutaProtegida = ({ children }) => {
    const { usuario, cargando } = useContext(AuthContext);
    if (cargando) return <div>Cargando...</div>;
    if (!usuario) return <Navigate to="/" />;
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
                <Route path="/usuarios" element={<RutaProtegida><GestionUsuarios /></RutaProtegida>} />
                <Route path="/clientes" element={<RutaProtegida><GestionClientes /></RutaProtegida>} />
                <Route path="/mascotas" element={<RutaProtegida><GestionMascotas /></RutaProtegida>} />
                <Route path="/citas" element={<RutaProtegida><GestionCitas /></RutaProtegida>} />
                <Route path="/inventario" element={<RutaProtegida><GestionInventario /></RutaProtegida>} />
                <Route path="/historial" element={<RutaProtegida><HistorialMedico /></RutaProtegida>} />
                <Route path="/guarderia" element={<RutaProtegida><GestionGuarderia /></RutaProtegida>} />
            </Routes>
        </HashRouter>
    );
}

export default App;