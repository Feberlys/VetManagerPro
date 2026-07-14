import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package, ShieldAlert, Plus, Edit2, X, ArchiveX, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

const GestionInventario = () => {
    const { usuario } = useContext(AuthContext);
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState('');
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    const [confirmacion, setConfirmacion] = useState({ mostrar: false, id: null, estadoActual: null });

    // Estados para los filtros y búsqueda
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'activos', 'inactivos'
    const [filtroCategoria, setFiltroCategoria] = useState('todas');

    const [formData, setFormData] = useState({
        id: null, 
        nombre: '', 
        descripcion: '', 
        cantidadActual: '', 
        nivelMinimo: '',
        categoria: 'General',
        fechaVencimiento: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const response = await api.get('/api/productos');
            setProductos(response.data);
        } catch (err) {
            setError('Error al cargar el inventario');
        }
    };

    const pedirConfirmacion = (id, estadoActual) => {
        setConfirmacion({ mostrar: true, id, estadoActual });
    };

    const ejecutarCambioEstado = async () => {
        const { id, estadoActual } = confirmacion;
        const accion = estadoActual ? 'desactivar' : 'activar';
        
        try {
            await api.patch(`/productos/${id}/${accion}`);
            setConfirmacion({ mostrar: false, id: null, estadoActual: null });
            cargarProductos();
        } catch (err) {
            alert(`Error al ${accion} el producto`);
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ 
            id: null, 
            nombre: '', 
            descripcion: '', 
            cantidadActual: '', 
            nivelMinimo: '',
            categoria: 'General',
            fechaVencimiento: '' 
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (prod) => {
        setModoEdicion(true);
        const fechaFormateada = prod.FechaVencimiento ? prod.FechaVencimiento.split('T')[0] : '';
        
        setFormData({
            id: prod.ProductoId,
            nombre: prod.Nombre,
            descripcion: prod.Descripcion,
            cantidadActual: prod.CantidadActual,
            nivelMinimo: prod.NivelMinimo,
            categoria: prod.Categoria || 'General',
            fechaVencimiento: fechaFormateada
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (parseInt(formData.cantidadActual) < 0 || parseInt(formData.nivelMinimo) < 0) {
            return alert("El stock y el nivel mínimo no pueden ser números negativos");
        }

        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                cantidadActual: parseInt(formData.cantidadActual),
                nivelMinimo: parseInt(formData.nivelMinimo),
                categoria: formData.categoria,
                fechaVencimiento: formData.fechaVencimiento || null
            };

            if (modoEdicion) {
                await api.put(`/productos/${formData.id}`, payload);
            } else {
                await api.post('/productos', payload);
            }
            setMostrarModal(false);
            cargarProductos();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al guardar el producto');
        }
    };

    // Lógica de filtrado combinada (Buscador + Estado + Categoría)
    const productosFiltrados = productos.filter(prod => {
        // Filtro por texto (busca en nombre y descripción)
        const textoBusqueda = busqueda.toLowerCase();
        const coincideTexto = prod.Nombre.toLowerCase().includes(textoBusqueda) || 
                              (prod.Descripcion && prod.Descripcion.toLowerCase().includes(textoBusqueda));
        
        // Filtro por estado
        const coincideEstado = filtroEstado === 'todos' 
            ? true 
            : (filtroEstado === 'activos' ? prod.Estado === true : prod.Estado === false);
        
        // Filtro por categoría
        const coincideCategoria = filtroCategoria === 'todas' 
            ? true 
            : prod.Categoria === filtroCategoria;

        return coincideTexto && coincideEstado && coincideCategoria;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Package className="text-emerald-600" size={32} />
                        Inventario de Clínica
                    </h1>
                    <p className="text-gray-500 mt-1">Catálogo de productos y medicamentos.</p>
                </div>
                {(usuario?.rolId === 1 || usuario?.rolId === 3) && (
                    <button 
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                )}
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o descripción..." 
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50/50"
                    />
                </div>
                
                <div className="flex gap-4 md:w-auto w-full">
                    <div className="flex items-center gap-2 w-1/2 md:w-auto">
                        <Filter className="text-gray-400" size={18} />
                        <select 
                            value={filtroEstado} 
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full md:w-36 py-2 px-3 border border-gray-200 rounded-xl outline-none focus:ring-emerald-500 cursor-pointer bg-gray-50/50 text-sm font-medium"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="activos">Activos</option>
                            <option value="inactivos">Inactivos</option>
                        </select>
                    </div>
                    
                    <select 
                        value={filtroCategoria} 
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="w-1/2 md:w-48 py-2 px-3 border border-gray-200 rounded-xl outline-none focus:ring-emerald-500 cursor-pointer bg-gray-50/50 text-sm font-medium"
                    >
                        <option value="todas">Todas las categorías</option>
                        <option value="General">General</option>
                        <option value="Analgésico">Analgésico</option>
                        <option value="Vacuna">Vacuna</option>
                        <option value="Antibiótico">Antibiótico</option>
                        <option value="Antiinflamatorio">Antiinflamatorio</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-r-md flex items-center gap-2 shadow-sm">
                    <ShieldAlert size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Producto</th>
                                <th className="py-4 px-6 font-semibold">Stock Actual</th>
                                <th className="py-4 px-6 font-semibold">Nivel Mínimo</th>
                                <th className="py-4 px-6 font-semibold">Categoría</th>
                                <th className="py-4 px-6 font-semibold">Vencimiento</th>
                                <th className="py-4 px-6 font-semibold">Estado</th>
                                {(usuario?.rolId === 1 || usuario?.rolId === 3) && <th className="py-4 px-6 font-semibold text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {productosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-500">
                                        No se encontraron productos con esos filtros.
                                    </td>
                                </tr>
                            ) : (
                                productosFiltrados.map((prod) => {
                                    const stockBajo = parseInt(prod.CantidadActual) <= parseInt(prod.NivelMinimo);
                                    
                                    return (
                                    <tr key={prod.ProductoId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{prod.Nombre}</span>
                                                <span className="text-xs text-gray-500">{prod.Descripcion}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`flex items-center gap-1.5 text-sm font-bold ${stockBajo ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {stockBajo && <AlertTriangle size={16} />}
                                                {prod.CantidadActual} unds.
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-gray-500">
                                                {prod.NivelMinimo} unds.
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-gray-700">
                                                {prod.Categoria || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-gray-500">
                                                {prod.FechaVencimiento ? new Date(prod.FechaVencimiento).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                prod.Estado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                                {prod.Estado ? '● Disponible' : '○ Inactivo'}
                                            </span>
                                        </td>
                                        
                                        {(usuario?.rolId === 1 || usuario?.rolId === 3) && (
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => abrirModalEditar(prod)}
                                                        disabled={!prod.Estado}
                                                        className={`p-2 border rounded-lg transition-all shadow-sm ${
                                                            prod.Estado 
                                                                ? 'bg-white border-gray-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200' 
                                                                : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                                                        }`}
                                                        title={prod.Estado ? "Editar Producto" : "Reactivar para editar"}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>

                                                    {usuario?.rolId === 1 && (
                                                        prod.Estado === true ? (
                                                            <button 
                                                                onClick={() => pedirConfirmacion(prod.ProductoId, prod.Estado)}
                                                                className="p-2 bg-white border border-gray-200 rounded-lg text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                                                                title="Desactivar Producto"
                                                            >
                                                                <ArchiveX size={16} />
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => pedirConfirmacion(prod.ProductoId, prod.Estado)}
                                                                className="p-2 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                                                                title="Reactivar Producto"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )})
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
                                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                                <input type="text" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cant. Actual</label>
                                    <input type="number" min="0" required value={formData.cantidadActual} onChange={(e) => setFormData({...formData, cantidadActual: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel Mínimo</label>
                                    <input type="number" min="0" required value={formData.nivelMinimo} onChange={(e) => setFormData({...formData, nivelMinimo: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                                    <select required value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                                        <option value="General">General</option>
                                        <option value="Analgésico">Analgésico</option>
                                        <option value="Vacuna">Vacuna</option>
                                        <option value="Antibiótico">Antibiótico</option>
                                        <option value="Antiinflamatorio">Antiinflamatorio</option>
                                    </select>
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Vencimiento</label>
                                    <input type="date" value={formData.fechaVencimiento} onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
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
                            {confirmacion.estadoActual ? '¿Desactivar Producto?' : '¿Reactivar Producto?'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 px-2">
                            {confirmacion.estadoActual
                                ? 'El producto ya no estará disponible para usarse en nuevas facturas o citas, pero se mantendrá en el historial.'
                                : 'El producto volverá a estar disponible y se podrán editar sus datos de stock.'}
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

export default GestionInventario;