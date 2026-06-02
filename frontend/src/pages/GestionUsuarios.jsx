import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserX, ShieldAlert, BadgeCheck, Plus, Edit2, X } from 'lucide-react';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');
    
    // Estados para el Modal (Ventana flotante)
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombreUsuario: '',
        nombreCompleto: '',
        correo: '',
        password: '',
        rolId: 2 // Por defecto: Veterinario
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            setError('Error al cargar la lista de usuarios');
        }
    };

    const handleDesactivar = async (id) => {
        if (!window.confirm('¿Estás segura de que deseas desactivar este usuario?')) return;
        try {
            await api.patch(`/usuarios/${id}/desactivar`);
            cargarUsuarios();
        } catch (err) {
            alert('Error al desactivar el usuario');
        }
    };

    // Funciones del Modal
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, nombreUsuario: '', nombreCompleto: '', correo: '', password: '', rolId: 2 });
        setMostrarModal(true);
    };

    const abrirModalEditar = (user) => {
        setModoEdicion(true);
        // Para editar, el backend solo pide nombreCompleto y rolId
        setFormData({
            id: user.UsuarioId,
            nombreUsuario: '', 
            nombreCompleto: user.NombreCompleto,
            correo: user.Correo,
            password: '', 
            rolId: user.RolId
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                // Actualizar usuario existente
                await api.put(`/usuarios/${formData.id}`, {
                    nombreCompleto: formData.nombreCompleto,
                    rolId: Number(formData.rolId)
                });
            } else {
                // Registrar usuario nuevo (Usamos la ruta de auth que creaste en el M1)
                await api.post('/usuarios', {
                    nombreUsuario: formData.nombreUsuario,
                    nombreCompleto: formData.nombreCompleto,
                    correo: formData.correo,
                    password: formData.password,
                    rolId: Number(formData.rolId)
                });
            }
            setMostrarModal(false);
            cargarUsuarios(); // Recargamos la tabla
        } catch (err) {
            alert(err.response?.data?.error || 'Error al guardar el usuario');
        }
    };

    // Helper para mostrar el nombre del rol según el RF-02
    const obtenerNombreRol = (rolId) => {
        if (rolId === 1) return 'Administrador';
        if (rolId === 2) return 'Veterinario';
        if (rolId === 3) return 'Recepcionista';
        return 'Desconocido';
    };

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
            
            {/* Cabecera con el botón de Nuevo Usuario */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Users className="text-emerald-600" size={32} />
                        Gestión de Empleados
                    </h1>
                    <p className="text-gray-500 mt-1">Administra los accesos y roles del personal (RF-02 y RF-03).</p>
                </div>
                <button 
                    onClick={abrirModalCrear}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Usuario
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md flex items-center gap-2">
                    <ShieldAlert size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Tabla */}
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
                                                {obtenerNombreRol(user.RolId)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            user.Estado ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.Estado ? '● Activo' : '○ Inactivo'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => abrirModalEditar(user)}
                                                className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                                                title="Editar Usuario"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            {user.Estado === true && (
                                                <button 
                                                    onClick={() => handleDesactivar(user.UsuarioId)}
                                                    className="inline-flex items-center justify-center p-2 bg-white border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                                                    title="Desactivar Usuario"
                                                >
                                                    <UserX size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Crear/Editar */}
            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!modoEdicion && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Usuario</label>
                                        <input type="text" required value={formData.nombreUsuario} onChange={(e) => setFormData({...formData, nombreUsuario: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                                        <input type="email" required value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                                        <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                                <input type="text" required value={formData.nombreCompleto} onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Rol en el Sistema (RF-02)</label>
                                <select 
                                    value={formData.rolId} 
                                    onChange={(e) => setFormData({...formData, rolId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="1">Administrador</option>
                                    <option value="2">Veterinario</option>
                                    <option value="3">Recepcionista</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setMostrarModal(false)} className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="w-1/2 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                                    {modoEdicion ? 'Guardar Cambios' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;