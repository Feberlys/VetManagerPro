import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Stethoscope, Search, Plus, X, ClipboardList, Syringe,
    Package, AlertTriangle, Calendar, User, Pill, PawPrint,
    Activity, ShieldCheck, Clock, FileText, CalendarCheck
} from 'lucide-react';

const HistorialMedico = () => {
    const { usuario } = useContext(AuthContext);
    const esVeterinario = usuario?.rolId === 2;

    // Búsqueda de mascota
    const [mascotaId, setMascotaId] = useState('');
    const [mascotaBuscada, setMascotaBuscada] = useState(null);

    // Datos
    const [historial, setHistorial] = useState([]);
    const [vacunas, setVacunas]     = useState([]);
    const [productos, setProductos] = useState([]);

    // UI
    const [tabActiva, setTabActiva] = useState('consultas');
    const [cargando, setCargando]   = useState(false);
    const [error, setError]         = useState('');

    // Modal consulta
    const [modalConsulta, setModalConsulta]         = useState(false);
    const [formConsulta, setFormConsulta]            = useState({
        diagnostico: '', tratamiento: '', notasAdicionales: '', citaId: ''
    });
    const [productosAgregados, setProductosAgregados]     = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [cantidadProducto, setCantidadProducto]         = useState(1);

    // Modal vacuna
    const [modalVacuna, setModalVacuna] = useState(false);
    const [formVacuna, setFormVacuna]   = useState({
        nombreVacuna: '', fechaAplicacion: '', fechaProximaDosis: '', productoId: ''
    });

    useEffect(() => { cargarProductos(); }, []);

    const cargarProductos = async () => {
        try {
            const res = await api.get('/productos');
            setProductos(res.data.filter(p => p.Estado === true && p.CantidadActual > 0));
        } catch (err) {
            console.error('Error cargando productos:', err);
        }
    };

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
        } catch (err) {
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

    // Abre el modal de consulta, opcionalmente pre-cargando un CitaId
    const abrirModalConsulta = (citaId = '') => {
        setFormConsulta({ diagnostico: '', tratamiento: '', notasAdicionales: '', citaId: citaId ? String(citaId) : '' });
        setProductosAgregados([]);
        setModalConsulta(true);
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

    const formatFechaHora = (fechaStr) => {
        if (!fechaStr) return '—';
        return new Date(fechaStr).toLocaleString('es-DO', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getVacunaStatus = (fechaProximaDosis) => {
        if (!fechaProximaDosis) return { label: 'Dosis única', classes: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };
        const hoy = new Date();
        const proxima = new Date(fechaProximaDosis);
        const dias = Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24));
        if (dias < 0)   return { label: 'Vencida',           classes: 'bg-red-50 text-red-600',     dot: 'bg-red-500' };
        if (dias <= 30) return { label: `Vence en ${dias}d`, classes: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' };
        return           { label: 'Al día',                  classes: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
    };

    const proximaVacuna = vacunas
        .filter(v => v.FechaProximaDosis && new Date(v.FechaProximaDosis) >= new Date())
        .sort((a, b) => new Date(a.FechaProximaDosis) - new Date(b.FechaProximaDosis))[0];

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-in { animation: fadeInUp 0.45s ease-out both; }
            `}</style>

            {/* Encabezado */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Stethoscope size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Historial Médico</h1>
                    <p className="text-sm text-gray-500">Consultas, tratamientos y vacunas por mascota</p>
                </div>
            </div>

            {/* Buscador */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <label className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-1.5">
                    <PawPrint size={15} className="text-emerald-600" /> ID de la mascota
                </label>
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={mascotaId}
                        onChange={e => setMascotaId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && buscarHistorial()}
                        placeholder="Ingresa el ID de la mascota..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                        onClick={buscarHistorial}
                        disabled={!mascotaId || cargando}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Search size={16} />
                        {cargando ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
                {error && (
                    <p className="text-red-500 text-sm mt-3 flex items-center gap-1.5">
                        <AlertTriangle size={14} /> {error}
                    </p>
                )}
            </div>

            {mascotaBuscada && (
                <>
                    {/* Tarjetas de resumen */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="anim-in bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4" style={{ animationDelay: '0ms' }}>
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <ClipboardList size={22} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800 leading-none">{historial.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Consultas registradas</p>
                            </div>
                        </div>
                        <div className="anim-in bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4" style={{ animationDelay: '80ms' }}>
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                                <Syringe size={22} className="text-teal-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800 leading-none">{vacunas.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Vacunas aplicadas</p>
                            </div>
                        </div>
                        <div className="anim-in bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4" style={{ animationDelay: '160ms' }}>
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock size={22} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-800 leading-none">
                                    {proximaVacuna ? formatFecha(proximaVacuna.FechaProximaDosis) : 'Ninguna'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {proximaVacuna ? `Próxima: ${proximaVacuna.NombreVacuna}` : 'Sin dosis pendientes'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Panel principal */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-100 flex-wrap gap-2">
                            <div className="flex">
                                <button
                                    onClick={() => setTabActiva('consultas')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                        tabActiva === 'consultas'
                                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <ClipboardList size={15} /> Consultas
                                </button>
                                <button
                                    onClick={() => setTabActiva('vacunas')}
                                    className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                        tabActiva === 'vacunas'
                                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Syringe size={15} /> Vacunas
                                </button>
                            </div>

                            {esVeterinario && (
                                <button
                                    onClick={() => tabActiva === 'consultas' ? abrirModalConsulta() : setModalVacuna(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors mb-2 shadow-sm"
                                >
                                    <Plus size={16} />
                                    {tabActiva === 'consultas' ? 'Nueva Consulta' : 'Registrar Vacuna'}
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {/* ---- TIMELINE DE CONSULTAS ---- */}
                            {tabActiva === 'consultas' && (
                                historial.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Activity size={44} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No hay consultas registradas para esta mascota.</p>
                                    </div>
                                ) : (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent" />

                                        <div className="space-y-5">
                                            {historial.map((consulta, i) => {
                                                const esCitaAtendida = consulta.TipoRegistro === 'cita_atendida';
                                                return (
                                                    <div key={consulta.HistorialId ?? `cita-${consulta.CitaId}`} className="anim-in relative" style={{ animationDelay: `${i * 70}ms` }}>
                                                        {/* Punto en la línea */}
                                                        <div className={`absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 ${esCitaAtendida ? 'border-blue-400' : 'border-emerald-500'}`}>
                                                            <div className={`w-2 h-2 rounded-full ${esCitaAtendida ? 'bg-blue-400' : 'bg-emerald-500'}`} />
                                                        </div>

                                                        <div className={`border rounded-xl p-4 transition-all bg-white ${esCitaAtendida ? 'border-blue-100 hover:border-blue-200 hover:shadow-sm' : 'border-gray-100 hover:border-emerald-200 hover:shadow-sm'}`}>
                                                            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <p className="font-semibold text-gray-800">
                                                                        {esCitaAtendida ? consulta.MotivoCita : consulta.Diagnostico}
                                                                    </p>
                                                                    {/* Badge que distingue el tipo */}
                                                                    {esCitaAtendida ? (
                                                                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                            <CalendarCheck size={11} /> Cita atendida · pendiente diagnóstico
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                            <Stethoscope size={11} /> Consulta
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                                    <Calendar size={11} /> {formatFecha(consulta.FechaConsulta)}
                                                                </span>
                                                            </div>

                                                            {/* Veterinario */}
                                                            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                                                                <User size={11} /> {consulta.NombreVeterinario}
                                                            </p>

                                                            {/* Motivo original de la cita (cuando viene de M3) */}
                                                            {!esCitaAtendida && consulta.MotivoCita && (
                                                                <div className="flex gap-2 mb-1.5 text-sm">
                                                                    <CalendarCheck size={14} className="text-blue-300 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-gray-500">
                                                                        <span className="font-medium text-gray-600">Motivo de cita: </span>
                                                                        {consulta.MotivoCita}
                                                                        {consulta.FechaCitaOriginal && (
                                                                            <span className="text-gray-400 ml-1">· {formatFechaHora(consulta.FechaCitaOriginal)}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Diagnóstico (solo para registros de historial) */}
                                                            {!esCitaAtendida && consulta.Diagnostico && (
                                                                <div className="flex gap-2 mb-1.5 text-sm">
                                                                    <Stethoscope size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-gray-600">
                                                                        <span className="font-medium text-gray-700">Diagnóstico: </span>
                                                                        {consulta.Diagnostico}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {consulta.Tratamiento && (
                                                                <div className="flex gap-2 mb-1.5 text-sm">
                                                                    <FileText size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-gray-600">
                                                                        <span className="font-medium text-gray-700">Tratamiento: </span>
                                                                        {consulta.Tratamiento}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {consulta.NotasAdicionales && (
                                                                <div className="flex gap-2 mb-1.5 text-sm">
                                                                    <FileText size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                                                                    <p className="text-gray-500">
                                                                        <span className="font-medium text-gray-600">Notas: </span>
                                                                        {consulta.NotasAdicionales}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Botón "Completar diagnóstico" para citas atendidas (solo veterinario) */}
                                                            {esCitaAtendida && esVeterinario && (
                                                                <button
                                                                    onClick={() => abrirModalConsulta(consulta.CitaId)}
                                                                    className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                                >
                                                                    <Plus size={13} /> Completar diagnóstico
                                                                </button>
                                                            )}

                                                            {/* Productos usados */}
                                                            {consulta.productosUsados && consulta.productosUsados.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
                                                                    {consulta.productosUsados.map(prod => (
                                                                        <span key={prod.ProductoId} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                                                            <Pill size={11} />
                                                                            {prod.NombreProducto}
                                                                            <span className="text-emerald-500">x{prod.Cantidad}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            )}

                            {/* ---- TARJETAS DE VACUNAS ---- */}
                            {tabActiva === 'vacunas' && (
                                vacunas.length === 0 ? (
                                    <div className="text-center py-16 text-gray-400">
                                        <Syringe size={44} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No hay vacunas registradas para esta mascota.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {vacunas.map((v, i) => {
                                            const status = getVacunaStatus(v.FechaProximaDosis);
                                            return (
                                                <div key={v.VacunaId} className="anim-in border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-all" style={{ animationDelay: `${i * 70}ms` }}>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
                                                                <Syringe size={17} className="text-teal-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-800 text-sm">{v.NombreVacuna}</p>
                                                                <p className="text-xs text-gray-400">{v.NombreVeterinario}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.classes}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-50">
                                                        <span className="flex items-center gap-1">
                                                            <ShieldCheck size={13} className="text-emerald-500" />
                                                            Aplicada {formatFecha(v.FechaAplicacion)}
                                                        </span>
                                                        {v.FechaProximaDosis && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={13} className="text-amber-500" />
                                                                {formatFecha(v.FechaProximaDosis)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {v.NombreProducto && (
                                                        <div className="mt-2">
                                                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                                                                <Pill size={10} /> {v.NombreProducto}
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

            {/* ======== MODAL: NUEVA CONSULTA ======== */}
            {modalConsulta && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto anim-in">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Stethoscope size={17} className="text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {formConsulta.citaId ? `Completar diagnóstico · Cita #${formConsulta.citaId}` : `Nueva Consulta · Mascota #${mascotaId}`}
                                </h2>
                            </div>
                            <button onClick={() => setModalConsulta(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={guardarConsulta} className="p-6 space-y-4">
                            {/* Mostrar CitaId si viene pre-cargado */}
                            {formConsulta.citaId && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-blue-700">
                                    <CalendarCheck size={14} />
                                    Esta consulta quedará vinculada a la Cita #{formConsulta.citaId}
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Diagnóstico *</label>
                                <textarea
                                    value={formConsulta.diagnostico}
                                    onChange={e => setFormConsulta({ ...formConsulta, diagnostico: e.target.value })}
                                    required rows={2}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    placeholder="Describe el diagnóstico..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Tratamiento</label>
                                <textarea
                                    value={formConsulta.tratamiento}
                                    onChange={e => setFormConsulta({ ...formConsulta, tratamiento: e.target.value })}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    placeholder="Tratamiento indicado..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Notas adicionales</label>
                                <textarea
                                    value={formConsulta.notasAdicionales}
                                    onChange={e => setFormConsulta({ ...formConsulta, notasAdicionales: e.target.value })}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    placeholder="Observaciones, seguimiento..."
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                                    <Package size={14} /> Productos / Medicamentos usados
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <select
                                        value={productoSeleccionado}
                                        onChange={e => setProductoSeleccionado(e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                        className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                                    />
                                    <button
                                        type="button" onClick={agregarProducto} disabled={!productoSeleccionado}
                                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {productosAgregados.length > 0 && (
                                    <div className="space-y-1.5">
                                        {productosAgregados.map(p => (
                                            <div key={p.productoId} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 text-sm">
                                                <span className="text-emerald-800 font-medium">{p.nombre}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-600 text-xs">x{p.cantidad}</span>
                                                    <button type="button" onClick={() => quitarProducto(p.productoId)} className="text-red-400 hover:text-red-600 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalConsulta(false)} className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                    Guardar Consulta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======== MODAL: REGISTRAR VACUNA ======== */}
            {modalVacuna && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md anim-in">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Syringe size={17} className="text-teal-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Registrar Vacuna · Mascota #{mascotaId}</h2>
                            </div>
                            <button onClick={() => setModalVacuna(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={guardarVacuna} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre de la vacuna *</label>
                                <input
                                    type="text" value={formVacuna.nombreVacuna}
                                    onChange={e => setFormVacuna({ ...formVacuna, nombreVacuna: e.target.value })}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ej: Antirrábica, Múltiple felina..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Fecha aplicación *</label>
                                    <input
                                        type="date" value={formVacuna.fechaAplicacion}
                                        onChange={e => setFormVacuna({ ...formVacuna, fechaAplicacion: e.target.value })}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Próxima dosis</label>
                                    <input
                                        type="date" value={formVacuna.fechaProximaDosis}
                                        onChange={e => setFormVacuna({ ...formVacuna, fechaProximaDosis: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Producto del inventario (opcional)</label>
                                <select
                                    value={formVacuna.productoId}
                                    onChange={e => setFormVacuna({ ...formVacuna, productoId: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Sin descuento de inventario</option>
                                    {productos.map(p => (
                                        <option key={p.ProductoId} value={p.ProductoId}>
                                            {p.Nombre} (Stock: {p.CantidadActual})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Si seleccionas un producto, se descuenta 1 unidad automáticamente.</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalVacuna(false)} className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                    Registrar Vacuna
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialMedico;
