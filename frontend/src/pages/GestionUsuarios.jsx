import { useState, useEffect } from 'react';
import api from '../services/api';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');

    // Cargar los usuarios en cuanto la pantalla se abre
    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            setError('Error al cargar la lista de usuarios');
            console.error(err);
        }
    };

    const handleDesactivar = async (id) => {
        if (!window.confirm('¿Estás segura de que deseas desactivar este usuario?')) return;
        
        try {
            await api.patch(`/usuarios/${id}/desactivar`);
            cargarUsuarios(); // Recargamos la tabla para ver el cambio
        } catch (err) {
            alert('Error al desactivar el usuario');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Gestión de Empleados</h1>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="w-1/4 text-left py-3 px-4 uppercase font-semibold text-sm">Nombre Completo</th>
                            <th className="w-1/4 text-left py-3 px-4 uppercase font-semibold text-sm">Correo</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rol</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Estado</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {usuarios.map((user) => (
                            <tr key={user.UsuarioId} className="border-b hover:bg-gray-50">
                                <td className="w-1/4 text-left py-3 px-4">{user.NombreCompleto}</td>
                                <td className="w-1/4 text-left py-3 px-4">{user.Correo}</td>
                                <td className="text-left py-3 px-4">{user.RolId === 1 ? 'Admin' : 'Veterinario/Recep'}</td>
                                <td className="text-left py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.Estado ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        {user.Estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="text-left py-3 px-4">
                                    {user.Estado === true && (
                                        <button 
                                            onClick={() => handleDesactivar(user.UsuarioId)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionUsuarios;