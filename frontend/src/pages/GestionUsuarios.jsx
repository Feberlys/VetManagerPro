import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, ShieldAlert, Plus, Edit2, X, ArchiveX, CheckCircle } from 'lucide-react';

const GestionUsuarios = () => {
    const { usuario } = useContext(AuthContext);
    const [usuariosLista, setUsuariosLista] = useState([]);
    const [error, setError] = useState('');
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    // Estado para la alerta bonita de confirmación
    const [confirmacion, setConfirmacion] = useState({ mostrar: false, id: null, estadoActual: null });

    const [formData, setFormData] = useState({
        id: null,
        nombreCompleto: '',
        email: '',
        password: '',
        rolId: '3' // Por defecto Recepcionista para evitar dar admin por error
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuariosLista(response.data);
        } catch (err) {
            setError('Error al cargar la lista de usuarios');
        }
    };

    // Funciones del Modal Bonito de Confirmación
    const pedirConfirmacion = (id, estadoActual) => {
        setConfirmacion({ mostrar: true, id, estadoActual });
    };

    const ejecutarCambioEstado = async () => {
        const { id, estadoActual } = confirmacion;
        const accion = estadoActual ? 'desactivar' : 'activar';
        
        try {
            await api.patch(`/usuarios/${id}/${accion}`);
            setConfirmacion({ mostrar: false, id: null, estadoActual: null });
            cargarUsuarios();
        } catch (err) {
            alert(`Error al ${accion} el usuario`);
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, nombreCompleto: '', email: '', password: '', rolId: '3' });
        setMostrarModal(true);
    };

    const abrirModalEditar = (user) => {
        setModoEdicion(true);
        setFormData({
            id: user.UsuarioId,
            nombreCompleto: user.NombreCompleto,
            email: user.Email,
            password: '', // Se deja vacío por seguridad, el backend debe ignorarlo si viene vacío
            rolId: user.RolId.toString()
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombreCompleto: formData.nombreCompleto,
                email: formData.email,
                rolId: parseInt(formData.rolId)
            };

            // Solo enviamos el password si el usuario escribió uno nuevo (o si es creación)
            if (formData.password) {
                payload.password = formData.password;
            }

            if (modoEdicion) {
                await api.put(`/usuarios/${formData.id}`, payload);
            } else {
                if (!formData.password) {
                    alert('La contraseña es obligatoria para usuarios nuevos.');
                    return;
                }
                await api.post('/usuarios', payload);
            }
            setMostrarModal(false);
            cargarUsuarios();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al guardar el usuario');
        }
    };

    const getNombreRol = (rolId) => {
        switch(rolId) {
            case 1: return 'Administrador';
            case 2: return 'Veterinario';
            case 3: return 'Recepcionista';
            default: return 'Desconocido';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-500 mt-1">Administración del personal de la clínica (M1).</p>
                </div>
                {/* Solo el admin debería ver esta pantalla según RF-03, pero mantenemos la validación por seguridad */}
                {usuario?.rolId === 1 && (
                    <button 
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Usuario
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md flex items-center gap-2">
                    <ShieldAlert size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Personal</th>
                                <th className="py-4 px-6 font-semibold">Rol en el Sistema</th>
                                <th className="py-4 px-6 font-semibold">Estado</th>
                                {usuario?.rolId === 1 && <th className="py-4 px-6 font-semibold text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuariosLista.map((user) => (
                                <tr key={user.UsuarioId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{user.NombreCompleto}</span>
                                            <span className="text-xs text-gray-500">{user.Email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            user.RolId === 1 ? 'bg-purple-100 text-purple-800' :
                                            user.RolId === 2 ? 'bg-blue-100 text-blue-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                            {getNombreRol(user.RolId)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            user.Estado ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.Estado ? '● Activo' : '○ Inactivo'}
                                        </span>
                                    </td>
                                    
                                    {usuario?.rolId === 1 && (
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                
                                                {/* Botón de Editar con lógica de bloqueo */}
                                                <button 
                                                    onClick={() => abrirModalEditar(user)}
                                                    disabled={!user.Estado}
                                                    className={`p-2 border rounded-lg transition-all ${
                                                        user.Estado 
                                                            ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' 
                                                            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                                    }`}
                                                    title={user.Estado ? "Editar Usuario" : "Reactivar para editar"}
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {/* No permitir que el usuario logueado se desactive a sí mismo por error */}
                                                {usuario.id !== user.UsuarioId && (
                                                    user.Estado === true ? (
                                                        <button 
                                                            onClick={() => pedirConfirmacion(user.UsuarioId, user.Estado)}
                                                            className="p-2 bg-white border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                                                            title="Desactivar Usuario"
                                                        >
                                                            <ArchiveX size={16} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => pedirConfirmacion(user.UsuarioId, user.Estado)}
                                                            className="p-2 bg-white border border-gray-300 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                                                            title="Reactivar Usuario"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Crear/Editar */}
            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
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
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                                <input type="text" required value={formData.nombreCompleto} onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                                    <input 
                                        type="password" 
                                        required={!modoEdicion} 
                                        placeholder={modoEdicion ? "Dejar en blanco para no cambiar" : ""}
                                        value={formData.password} 
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" 
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                                    <select 
                                        value={formData.rolId} 
                                        onChange={(e) => setFormData({...formData, rolId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="1">Administrador</option>
                                        <option value="2">Veterinario</option>
                                        <option value="3">Recepcionista</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setMostrarModal(false)} className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" className="w-1/2 py-2.5 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Bonito de Confirmación */}
            {confirmacion.mostrar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
                        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${confirmacion.estadoActual ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {confirmacion.estadoActual ? <ArchiveX size={32} /> : <CheckCircle size={32} />}
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                            {confirmacion.estadoActual ? '¿Desactivar Usuario?' : '¿Reactivar Usuario?'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 px-2">
                            {confirmacion.estadoActual
                                ? 'El usuario no podrá iniciar sesión en el sistema, pero su historial de acciones se mantendrá.'
                                : 'El usuario recuperará su acceso al sistema y podrá volver a operar según su rol.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmacion({ mostrar: false, id: null, estadoActual: null })}
                                className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ejecutarCambioEstado}
                                className={`w-1/2 py-2.5 px-4 text-white font-bold rounded-lg shadow-sm transition-colors ${
                                    confirmacion.estadoActual ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;