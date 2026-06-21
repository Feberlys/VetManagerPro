import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Stethoscope, Search, Plus, X, ClipboardList, Syringe,
    Package, AlertTriangle, Calendar, User, Pill, PawPrint,
    Activity, ShieldCheck, Clock, FileText
} from 'lucide-react';

const HistorialMedico = () => {
    const { usuario } = useContext(AuthContext);
    const esVeterinario = usuario?.rolId === 2;

    const [mascotaId, setMascotaId] = useState('');
    const [mascotaBuscada, setMascotaBuscada] = useState(null);

    const [historial, setHistorial] = useState([]);
    const [vacunas, setVacunas] = useState([]);
    const [productos, setProductos] = useState([]);

    const [tabActiva, setTabActiva] = useState('consultas');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const [modalConsulta, setModalConsulta] = useState(false);
    const [formConsulta, setFormConsulta] = useState({
        diagnostico: '', tratamiento: '', notasAdicionales: '', citaId: ''
    });
    const [productosAgregados, setProductosAgregados] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [cantidadProducto, setCantidadProducto] = useState(1);

    const [modalVacuna, setModalVacuna] = useState(false);
    const [formVacuna, setFormVacuna] = useState({
        nombreVacuna: '', fechaAplicacion: '', fechaProximaDosis: '', productoId: ''
    });

    const cargarProductos = async () => {
        try {
            const res = await api.get('/productos');
            setProductos(res.data.filter(p => p.Estado === true && p.CantidadActual > 0));
        } catch (err) {
            console.error('Error cargando productos:', err);
        }
    };

    useEffect(() => { cargarProductos(); }, []);

    const buscarHistorial = async () => {
        if (!mascotaId) return;
        setCargando(true);
        setError('');
        try {
            const [resHistorial, resVacunas] = await Promise.all([
                api.get(`/historial/mascota/${mascotaId}`),
                api.get(`/vacunas/mascota/${mascotaId}`)
            ]);
            setHistorial(resHistorial.data);
            setVacunas(resVacunas.data);
            setMascotaBuscada(mascotaId);
        } catch {
            setError('No se encontró historial para esa mascota o ocurrió un error.');
            setHistorial([]);
            setVacunas([]);
            setMascotaBuscada(null);
        } finally {
            setCargando(false);
        }
    };

    const agregarProducto = () => {
        if (!productoSeleccionado || cantidadProducto <= 0) return;
        const prod = productos.find(p => p.ProductoId === parseInt(productoSeleccionado));
        if (!prod) return;
        if (productosAgregados.some(p => p.productoId === prod.ProductoId)) {
            alert('Ese producto ya está en la lista.');
            return;
        }
        setProductosAgregados([...productosAgregados, {
            productoId: prod.ProductoId,
            nombre: prod.Nombre,
            cantidad: parseInt(cantidadProducto),
            stock: prod.CantidadActual
        }]);
        setProductoSeleccionado('');
        setCantidadProducto(1);
    };

    const quitarProducto = (productoId) => {
        setProductosAgregados(productosAgregados.filter(p => p.productoId !== productoId));
    };

    const guardarConsulta = async (e) => {
        e.preventDefault();
        try {
            await api.post('/historial', {
                mascotaId: parseInt(mascotaId),
                citaId: formConsulta.citaId ? parseInt(formConsulta.citaId) : null,
                diagnostico: formConsulta.diagnostico,
                tratamiento: formConsulta.tratamiento,
                notasAdicionales: formConsulta.notasAdicionales,
                productosUsados: productosAgregados.map(p => ({
                    productoId: p.productoId, cantidad: p.cantidad
                }))
            });
            setModalConsulta(false);
            setFormConsulta({ diagnostico: '', tratamiento: '', notasAdicionales: '', citaId: '' });
            setProductosAgregados([]);
            cargarProductos();
            buscarHistorial();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al guardar la consulta.');
        }
    };

    const guardarVacuna = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vacunas', {
                mascotaId: parseInt(mascotaId),
                nombreVacuna: formVacuna.nombreVacuna,
                fechaAplicacion: formVacuna.fechaAplicacion,
                fechaProximaDosis: formVacuna.fechaProximaDosis || null,
                productoId: formVacuna.productoId ? parseInt(formVacuna.productoId) : null
            });
            setModalVacuna(false);
            setFormVacuna({ nombreVacuna: '', fechaAplicacion: '', fechaProximaDosis: '', productoId: '' });
            cargarProductos();
            buscarHistorial();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al guardar la vacuna.');
        }
    };

    const formatFecha = (fechaStr) => {
        if (!fechaStr) return '—';
        return new Date(fechaStr).toLocaleDateString('es-DO', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getVacunaStatus = (fechaProximaDosis) => {
        if (!fechaProximaDosis) return { label: 'Dosis única', classes: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' };
        const hoy = new Date();
        const proxima = new Date(fechaProximaDosis);
        const dias = Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24));
        if (dias < 0) return { label: 'Vencida', classes: 'bg-rose-50 text-rose-700 border border-rose-200', dot: 'bg-rose-500' };
        if (dias <= 30) return { label: `Vence en ${dias}d`, classes: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' };
        return { label: 'Al día', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' };
    };

    const proximaVacuna = vacunas
        .filter(v => v.FechaProximaDosis && new Date(v.FechaProximaDosis) >= new Date())
        .sort((a, b) => new Date(a.FechaProximaDosis) - new Date(b.FechaProximaDosis))[0];

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
            <div className="space-y-6">
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(14px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .anim-in { animation: fadeInUp 0.45s ease-out both; }
                `}</style>

                {/* Encabezado */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Stethoscope size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Historial Médico</h1>
                        <p className="text-gray-500 mt-1">Consultas, tratamientos y vacunas por paciente.</p>
                    </div>
                </div>

                {/* Buscador */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                        <PawPrint size={16} className="text-emerald-600" /> ID de la mascota
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            value={mascotaId}
                            onChange={e => setMascotaId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && buscarHistorial()}
                            placeholder="Ingresa el ID de la mascota..."
                            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <button
                            onClick={buscarHistorial}
                            disabled={!mascotaId || cargando}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                            <Search size={18} />
                            {cargando ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                    {error && (
                        <p className="text-rose-500 text-sm mt-3 flex items-center gap-1.5 font-medium">
                            <AlertTriangle size={16} /> {error}
                        </p>
                    )}
                </div>

                {mascotaBuscada && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="anim-in bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4" style={{ animationDelay: '0ms' }}>
                                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                                    <ClipboardList size={26} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-extrabold text-gray-800 leading-none">{historial.length}</p>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Consultas registradas</p>
                                </div>
                            </div>
                            <div className="anim-in bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4" style={{ animationDelay: '80ms' }}>
                                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100">
                                    <Syringe size={26} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-extrabold text-gray-800 leading-none">{vacunas.length}</p>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Vacunas aplicadas</p>
                                </div>
                            </div>
                            <div className="anim-in bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4" style={{ animationDelay: '160ms' }}>
                                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                                    <Clock size={26} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-extrabold text-gray-800 leading-none">
                                        {proximaVacuna ? formatFecha(proximaVacuna.FechaProximaDosis) : 'Ninguna'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium line-clamp-1">
                                        {proximaVacuna ? `Próxima: ${proximaVacuna.NombreVacuna}` : 'Sin dosis pendientes'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-100 flex-wrap gap-2">
                                <div className="flex">
                                    <button
                                        onClick={() => setTabActiva('consultas')}
                                        className={`px-5 py-3 text-sm font-bold transition-colors flex items-center gap-2 ${
                                            tabActiva === 'consultas'
                                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 rounded-t-lg'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg'
                                        }`}
                                    >
                                        <ClipboardList size={18} /> Consultas
                                    </button>
                                    <button
                                        onClick={() => setTabActiva('vacunas')}
                                        className={`px-5 py-3 text-sm font-bold transition-colors flex items-center gap-2 ${
                                            tabActiva === 'vacunas'
                                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 rounded-t-lg'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-lg'
                                        }`}
                                    >
                                        <Syringe size={18} /> Vacunas
                                    </button>
                                </div>

                                {esVeterinario && (
                                    <button
                                        onClick={() => tabActiva === 'consultas' ? setModalConsulta(true) : setModalVacuna(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 mb-2"
                                    >
                                        <Plus size={18} />
                                        {tabActiva === 'consultas' ? 'Nueva Consulta' : 'Registrar Vacuna'}
                                    </button>
                                )}
                            </div>

                            <div className="p-6 md:p-8">
                                {tabActiva === 'consultas' && (
                                    historial.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <Activity size={56} className="mx-auto mb-4 opacity-30 text-emerald-600" />
                                            <p className="text-base font-medium">No hay consultas registradas para esta mascota.</p>
                                        </div>
                                    ) : (
                                        <div className="relative pl-8">
                                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent" />
                                            <div className="space-y-6">
                                                {historial.map((consulta, i) => (
                                                    <div key={consulta.HistorialId} className="anim-in relative" style={{ animationDelay: `${i * 70}ms` }}>
                                                        <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        </div>

                                                        <div className="border border-gray-100 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all bg-white">
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                                <h3 className="text-lg font-bold text-gray-900">{consulta.Diagnostico}</h3>
                                                                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-1.5 w-fit">
                                                                    <Calendar size={14} className="text-emerald-600" /> {formatFecha(consulta.FechaConsulta)}
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4 font-medium">
                                                                <User size={14} className="text-emerald-600" /> Atendido por: {consulta.NombreVeterinario}
                                                            </p>

                                                            {consulta.Tratamiento && (
                                                                <div className="flex gap-2.5 mb-2 text-sm bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                                                                    <FileText size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-gray-700">
                                                                        <span className="font-bold text-gray-900">Tratamiento: </span>
                                                                        {consulta.Tratamiento}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {consulta.NotasAdicionales && (
                                                                <div className="flex gap-2.5 mb-2 text-sm bg-amber-50/50 p-3 rounded-xl border border-amber-50">
                                                                    <FileText size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-gray-600">
                                                                        <span className="font-bold text-gray-800">Notas: </span>
                                                                        {consulta.NotasAdicionales}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {consulta.productosUsados && consulta.productosUsados.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                                                                    {consulta.productosUsados.map(prod => (
                                                                        <span key={prod.ProductoId} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                                            <Pill size={12} className="text-emerald-600" />
                                                                            {prod.NombreProducto}
                                                                            <span className="text-emerald-600 ml-1">x{prod.Cantidad}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}

                                {tabActiva === 'vacunas' && (
                                    vacunas.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <Syringe size={56} className="mx-auto mb-4 opacity-30 text-teal-600" />
                                            <p className="text-base font-medium">No hay vacunas registradas para esta mascota.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {vacunas.map((v, i) => {
                                                const status = getVacunaStatus(v.FechaProximaDosis);
                                                return (
                                                    <div key={v.VacunaId} className="anim-in border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-teal-100 transition-all bg-white" style={{ animationDelay: `${i * 70}ms` }}>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100">
                                                                    <Syringe size={18} className="text-teal-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-extrabold text-gray-900 text-base">{v.NombreVacuna}</p>
                                                                    <p className="text-xs font-medium text-gray-500 mt-0.5">{v.NombreVeterinario}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.classes}`}>
                                                                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex items-center gap-1.5 font-medium">
                                                                    <ShieldCheck size={16} className="text-emerald-500" /> Aplicada:
                                                                </span>
                                                                <span className="font-bold text-gray-800">{formatFecha(v.FechaAplicacion)}</span>
                                                            </div>
                                                            {v.FechaProximaDosis && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="flex items-center gap-1.5 font-medium">
                                                                        <Clock size={16} className="text-amber-500" /> Próx. Dosis:
                                                                    </span>
                                                                    <span className="font-bold text-gray-800">{formatFecha(v.FechaProximaDosis)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {v.NombreProducto && (
                                                            <div className="mt-3">
                                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold">
                                                                    <Pill size={12} className="text-emerald-600" /> {v.NombreProducto}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}

                {modalConsulta && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto anim-in">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                                        <Stethoscope size={20} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900">Nueva Consulta</h2>
                                </div>
                                <button onClick={() => setModalConsulta(false)} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={guardarConsulta} className="p-6 space-y-5">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Diagnóstico *</label>
                                    <textarea
                                        value={formConsulta.diagnostico}
                                        onChange={e => setFormConsulta({ ...formConsulta, diagnostico: e.target.value })}
                                        required rows={2}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                                        placeholder="Describe el diagnóstico detallado..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Tratamiento</label>
                                    <textarea
                                        value={formConsulta.tratamiento}
                                        onChange={e => setFormConsulta({ ...formConsulta, tratamiento: e.target.value })}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                                        placeholder="Medicamentos, dosis, indicaciones..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Notas adicionales</label>
                                    <textarea
                                        value={formConsulta.notasAdicionales}
                                        onChange={e => setFormConsulta({ ...formConsulta, notasAdicionales: e.target.value })}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
                                        placeholder="Observaciones de seguimiento..."
                                    />
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                                        <Package size={16} className="text-emerald-600" /> Descontar del Inventario (Opcional)
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <select
                                            value={productoSeleccionado}
                                            onChange={e => setProductoSeleccionado(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        >
                                            <option value="">Selecciona un producto...</option>
                                            {productos.map(p => (
                                                <option key={p.ProductoId} value={p.ProductoId}>
                                                    {p.Nombre} (Stock: {p.CantidadActual})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number" min="1" value={cantidadProducto}
                                            onChange={e => setCantidadProducto(parseInt(e.target.value) || 1)}
                                            className="w-20 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center transition-all"
                                        />
                                        <button
                                            type="button" onClick={agregarProducto} disabled={!productoSeleccionado}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 disabled:bg-gray-400 transition-all shadow-sm"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    {productosAgregados.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {productosAgregados.map(p => (
                                                <div key={p.productoId} className="flex items-center justify-between bg-white border border-emerald-100 rounded-xl px-4 py-2.5 text-sm shadow-sm">
                                                    <span className="text-emerald-900 font-bold flex items-center gap-2">
                                                        <Pill size={14} className="text-emerald-500" /> {p.nombre}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold text-xs">x{p.cantidad}</span>
                                                        <button type="button" onClick={() => quitarProducto(p.productoId)} className="text-rose-400 hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setModalConsulta(false)} className="w-1/2 border border-gray-300 text-gray-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                        Guardar Consulta
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {modalVacuna && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md anim-in overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
                                        <Syringe size={20} className="text-teal-600" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900">Registrar Vacuna</h2>
                                </div>
                                <button onClick={() => setModalVacuna(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={guardarVacuna} className="p-6 space-y-5">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Nombre de la vacuna *</label>
                                    <input
                                        type="text" value={formVacuna.nombreVacuna}
                                        onChange={e => setFormVacuna({ ...formVacuna, nombreVacuna: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        placeholder="Ej: Antirrábica, Múltiple felina..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-1.5">Fecha aplicación *</label>
                                        <input
                                            type="date" value={formVacuna.fechaAplicacion}
                                            onChange={e => setFormVacuna({ ...formVacuna, fechaAplicacion: e.target.value })}
                                            required
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-1.5">Próxima dosis</label>
                                        <input
                                            type="date" value={formVacuna.fechaProximaDosis}
                                            onChange={e => setFormVacuna({ ...formVacuna, fechaProximaDosis: e.target.value })}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <label className="text-sm font-bold text-emerald-900 block mb-2 flex items-center gap-1.5">
                                        <Package size={16} className="text-emerald-600" /> Descontar del inventario
                                    </label>
                                    <select
                                        value={formVacuna.productoId}
                                        onChange={e => setFormVacuna({ ...formVacuna, productoId: e.target.value })}
                                        className="w-full border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                                    >
                                        <option value="">No descontar inventario</option>
                                        {productos.map(p => (
                                            <option key={p.ProductoId} value={p.ProductoId}>
                                                {p.Nombre} (Stock: {p.CantidadActual})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-emerald-700 font-medium mt-2">Restará 1 unidad automáticamente.</p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setModalVacuna(false)} className="w-1/2 border border-gray-300 text-gray-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                        Guardar Vacuna
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialMedico;