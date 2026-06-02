import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package, ShieldAlert, Plus, Edit2, X, ArchiveX } from 'lucide-react';

const GestionInventario = () => {
    const { usuario } = useContext(AuthContext); // Traemos al usuario para saber su rol
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState('');
    
    // Estados para el Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        descripcion: '',
        precio: '',
        stock: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const response = await api.get('/productos');
            setProductos(response.data);
        } catch (err) {
            setError('Error al cargar el inventario');
        }
    };

    const handleDesactivar = async (id) => {
        if (!window.confirm('¿Estás segura de que deseas marcar este producto como inactivo?')) return;
        try {
            await api.patch(`/productos/${id}/desactivar`);
            cargarProductos();
        } catch (err) {
            alert('Error al desactivar el producto');
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, nombre: '', descripcion: '', precio: '', stock: '' });
        setMostrarModal(true);
    };

    const abrirModalEditar = (prod) => {
        setModoEdicion(true);
        setFormData({
            id: prod.ProductoId,
            nombre: prod.Nombre,
            descripcion: prod.Descripcion,
            precio: prod.Precio,
            stock: prod.Stock
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: parseFloat(formData.precio),
                stock: parseInt(formData.stock)
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

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Package className="text-emerald-600" size={32} />
                        Inventario de Clínica
                    </h1>
                    <p className="text-gray-500 mt-1">Catálogo de productos, medicamentos y servicios (M7).</p>
                </div>
                {/* Solo el Admin (Rol 1) puede agregar productos */}
                {usuario?.rolId === 1 && (
                    <button 
                        onClick={abrirModalCrear}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Producto
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
                                <th className="py-4 px-6 font-semibold">Producto / Servicio</th>
                                <th className="py-4 px-6 font-semibold">Precio (RD$)</th>
                                <th className="py-4 px-6 font-semibold">Stock</th>
                                <th className="py-4 px-6 font-semibold">Estado</th>
                                {usuario?.rolId === 1 && <th className="py-4 px-6 font-semibold text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {productos.map((prod) => (
                                <tr key={prod.ProductoId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{prod.Nombre}</span>
                                            <span className="text-xs text-gray-500">{prod.Descripcion}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">
                                        ${prod.Precio.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-sm font-bold ${prod.Stock <= 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {prod.Stock} unds.
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            prod.Estado ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {prod.Estado ? '● Disponible' : '○ Inactivo'}
                                        </span>
                                    </td>
                                    
                                    {/* Controles de Admin */}
                                    {usuario?.rolId === 1 && (
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => abrirModalEditar(prod)}
                                                    className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {prod.Estado === true && (
                                                    <button 
                                                        onClick={() => handleDesactivar(prod.ProductoId)}
                                                        className="p-2 bg-white border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                                                    >
                                                        <ArchiveX size={16} />
                                                    </button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (Opcional)</label>
                                <input type="text" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Precio</label>
                                    <input type="number" step="0.01" required value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                                    <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setMostrarModal(false)} className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" className="w-1/2 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionInventario;