import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserX, ShieldAlert, BadgeCheck } from 'lucide-react';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');

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
        if (!window.confirm('¿Estás segura de que deseas desactivar este usuario? No podrá acceder al sistema.')) return;
        try {
            await api.patch(`/usuarios/${id}/desactivar`);
            cargarUsuarios();
        } catch (err) {
            alert('Error al desactivar el usuario');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Users className="text-emerald-600" size={32} />
                        Gestión de Empleados
                    </h1>
                    <p className="text-gray-500 mt-1">Administra los accesos y roles del personal de la clínica.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md flex items-center gap-2">
                    <ShieldAlert size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Contenedor de la Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Usuario</th>
                                <th className="py-4 px-6 font-semibold">Rol</th>
                                <th className="py-4 px-6 font-semibold">Estado</th>
                                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.map((user) => (
                                <tr key={user.UsuarioId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{user.NombreCompleto}</span>
                                            <span className="text-sm text-gray-500">{user.Correo}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5">
                                            {user.RolId === 1 ? (
                                                <BadgeCheck size={16} className="text-emerald-600" />
                                            ) : (
                                                <Users size={16} className="text-gray-400" />
                                            )}
                                            <span className={`text-sm font-medium ${user.RolId === 1 ? 'text-emerald-700' : 'text-gray-600'}`}>
                                                {user.RolId === 1 ? 'Administrador' : 'Staff (Veterinario/Recep)'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            user.Estado 
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}>
                                            {user.Estado ? '● Activo' : '○ Inactivo'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {user.Estado === true && (
                                            <button 
                                                onClick={() => handleDesactivar(user.UsuarioId)}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <UserX size={16} />
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
        </div>
    );
};

export default GestionUsuarios;