import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, ShieldAlert, Plus, Edit2, X, ArchiveX, CheckCircle, Search, Filter } from 'lucide-react';

const GestionUsuarios = () => {
    const { usuario } = useContext(AuthContext);
    const [usuariosLista, setUsuariosLista] = useState([]);
    const [error, setError] = useState('');
    
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activo'); 
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [confirmacion, setConfirmacion] = useState({ mostrar: false, id: null, estadoActual: null });

    const [formData, setFormData] = useState({
        id: null, nombreUsuario: '', nombreCompleto: '', email: '', password: '', rolId: '3'
    });

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/usuarios');
            setUsuariosLista(response.data);
        } catch {
            setError('Error al cargar la lista de usuarios');
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const getNombreRol = (rolId) => {
        switch(rolId) {
            case 1: return 'Administrador';
            case 2: return 'Veterinario';
            case 3: return 'Recepcionista';
            default: return 'Desconocido';
        }
    };

    const usuariosFiltrados = usuariosLista.filter((user) => {
        const cumpleEstado = 
            filtroEstado === 'todos' ? true :
            filtroEstado === 'activo' ? user.Estado === true :
            filtroEstado === 'inactivo' ? user.Estado === false : true;

        const termino = busqueda.toLowerCase();
        const cumpleBusqueda = 
            user.NombreCompleto.toLowerCase().includes(termino) ||
            getNombreRol(user.RolId).toLowerCase().includes(termino);

        return cumpleEstado && cumpleBusqueda;
    });

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
        } catch {
            alert(`Error al ${accion} el usuario`);
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, nombreUsuario: '', nombreCompleto: '', email: '', password: '', rolId: '3' });
        setMostrarModal(true);
    };

    const abrirModalEditar = (user) => {
        setModoEdicion(true);
        setFormData({
         id: user.UsuarioId,
         nombreUsuario: user.NombreUsuario || '',
         nombreCompleto: user.NombreCompleto || '',
         email: user.Correo || '',
         password: '',
         rolId: user.RolId.toString()
  });
     setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombreUsuario: formData.nombreUsuario,
                nombreCompleto: formData.nombreCompleto,
                correo: formData.email,
                rolId: parseInt(formData.rolId)
            };

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

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Users className="text-emerald-600" size={32} />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-500 mt-1">Administración del personal de la clínica.</p>
                </div>
                {usuario?.rolId === 1 && (
                    <button 
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={20} />
                        Nuevo Usuario
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-r-md flex items-center gap-2 shadow-sm">
                    <ShieldAlert size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o puesto (ej. Veterinario)..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                        <Filter className="text-emerald-600" size={20} />
                    </div>
                    <select
                        className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-700 font-medium cursor-pointer transition-all"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="activo">Solo Activos</option>
                        <option value="inactivo">Solo Inactivos</option>
                        <option value="todos">Todos los Usuarios</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Personal</th>
                                <th className="py-4 px-6 font-semibold">Rol en el Sistema</th>
                                <th className="py-4 px-6 font-semibold">Estado</th>
                                {usuario?.rolId === 1 && <th className="py-4 px-6 font-semibold text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {usuariosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500">
                                        No se encontraron usuarios que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                usuariosFiltrados.map((user) => (
                                    <tr key={user.UsuarioId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{user.NombreCompleto}</span>
                                                <span className="text-xs text-gray-500">{user.Email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                user.RolId === 1 ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.RolId === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-orange-50 text-orange-700 border-orange-200'
                                            }`}>
                                                {getNombreRol(user.RolId)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                user.Estado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                                {user.Estado ? '● Activo' : '○ Inactivo'}
                                            </span>
                                        </td>
                                        
                                        {usuario?.rolId === 1 && (
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => abrirModalEditar(user)}
                                                        disabled={!user.Estado}
                                                        className={`p-2 border rounded-lg transition-all shadow-sm ${
                                                            user.Estado 
                                                                ? 'bg-white border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200' 
                                                                : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                                                        }`}
                                                        title={user.Estado ? "Editar Usuario" : "Reactivar para editar"}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>

                                                    {usuario.id !== user.UsuarioId && (
                                                        user.Estado === true ? (
                                                            <button 
                                                                onClick={() => pedirConfirmacion(user.UsuarioId, user.Estado)}
                                                                className="p-2 bg-white border border-gray-200 rounded-lg text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                                                                title="Desactivar Usuario"
                                                            >
                                                                <ArchiveX size={16} />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => pedirConfirmacion(user.UsuarioId, user.Estado)}
                                                                className="p-2 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-extrabold text-gray-800">
                                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Usuario</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombreUsuario}
                                    onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="doctor1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                                <input type="text" required value={formData.nombreCompleto} onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                                    <input 
                                        type="password" 
                                        required={!modoEdicion} 
                                        placeholder={modoEdicion ? "En blanco si no cambia" : ""}
                                        value={formData.password} 
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm" 
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                                    <select 
                                        value={formData.rolId} 
                                        onChange={(e) => setFormData({...formData, rolId: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    >
                                        <option value="1">Administrador</option>
                                        <option value="2">Veterinario</option>
                                        <option value="3">Recepcionista</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setMostrarModal(false)} className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" className="w-1/2 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmacion.mostrar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center transform transition-all">
                        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${confirmacion.estadoActual ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
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
                                className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ejecutarCambioEstado}
                                className={`w-1/2 py-2.5 px-4 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
                                    confirmacion.estadoActual ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
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