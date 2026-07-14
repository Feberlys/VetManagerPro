/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Stethoscope, Search, Plus, X, ClipboardList, Syringe,
    Package, AlertTriangle, Calendar, User, Pill, PawPrint,
    Activity, ShieldCheck, Clock, FileText
} from 'lucide-react';

const HistorialMedico = () => {
    const { usuario } = useContext(AuthContext);
    const navigate = useNavigate();
    const esVeterinario = usuario?.rolId === 2;

    const [mascotaId, setMascotaId] = useState('');
    const [mascotaBuscada, setMascotaBuscada] = useState(null);

    const [mascotas, setMascotas] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    const [historial, setHistorial] = useState([]);
    const [vacunas, setVacunas] = useState([]);
    const [productos, setProductos] = useState([]);

    const [tabActiva, setTabActiva] = useState('consultas');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const [modalVacuna, setModalVacuna] = useState(false);
    const [formVacuna, setFormVacuna] = useState({
        nombreVacuna: '', fechaAplicacion: '', fechaProximaDosis: '', productoId: ''
    });

    const cargarDatosIniciales = async () => {
    try {
        const [productosRes, mascotasRes, clientesRes] = await Promise.all([
            api.get('/productos'),
            api.get('/mascotas'),
            api.get('/clientes')
        ]);

        setProductos(
            productosRes.data.filter(
                (producto) =>
                    producto.Estado === true &&
                    Number(producto.CantidadActual) > 0
            )
        );

        setMascotas(mascotasRes.data);
        setClientes(clientesRes.data);
    } catch (err) {
        console.error('Error cargando datos del historial:', err);
        setError('No se pudieron cargar los datos del historial.');
    }
};

    useEffect(() => { cargarDatosIniciales(); }, []);

    const obtenerNombreCliente = (cliente) => {
    if (!cliente) {
        return 'Cliente no identificado';
    }

    return (
        cliente.NombreCompleto ||
        cliente.Nombre ||
        cliente.NombreCliente ||
        cliente.Correo ||
        'Cliente no identificado'
    );
};

    const obtenerClienteMascota = (mascota) => {
    if (!mascota) {
        return null;
    }

    return clientes.find(
        (cliente) =>
            Number(cliente.ClienteId) === Number(mascota.ClienteId)
        );
    };

    const obtenerNombrePropietarioMascota = (mascota) => {
    const cliente = obtenerClienteMascota(mascota);

    return obtenerNombreCliente(cliente);
    };

    const buscarMascotas = (valor) => {
    setTerminoBusqueda(valor);
    setMascotaId('');
    setMascotaBuscada(null);

    const termino = valor.trim().toLowerCase();

    if (!termino) {
        setResultadosBusqueda([]);
        setMostrarResultados(false);
        return;
    }

    const resultados = mascotas.filter((mascota) => {
        const nombreMascota = String(
            mascota.Nombre || ''
        ).toLowerCase();

        const nombrePropietario = String(
            obtenerNombrePropietarioMascota(mascota)
        ).toLowerCase();

        return (
            nombreMascota.includes(termino) ||
            nombrePropietario.includes(termino)
        );
    });

    setResultadosBusqueda(resultados);
    setMostrarResultados(true);
    };

    const seleccionarMascota = async (mascota) => {
    setMascotaId(String(mascota.MascotaId));
    setMascotaBuscada(mascota);

    setTerminoBusqueda(
        `${mascota.Nombre} — ${obtenerNombrePropietarioMascota(mascota)}`
    );

    setResultadosBusqueda([]);
    setMostrarResultados(false);

    await buscarHistorialPorMascota(mascota);
    };

    const buscarHistorialPorMascota = async (mascota) => {
    if (!mascota?.MascotaId) {
        return;
    }

    setCargando(true);
    setError('');

    try {
        const [resHistorial, resVacunas] = await Promise.all([
            api.get(`/historial/mascota/${mascota.MascotaId}`),
            api.get(`/vacunas/mascota/${mascota.MascotaId}`)
        ]);

        setHistorial(resHistorial.data);
        setVacunas(resVacunas.data);

        setMascotaId(String(mascota.MascotaId));
        setMascotaBuscada(mascota);
    } catch (err) {
        console.error('Error buscando historial:', err);

        setError(
            'No se pudo cargar el historial médico de la mascota seleccionada.'
        );

        setHistorial([]);
        setVacunas([]);
        setMascotaBuscada(null);
    } finally {
        setCargando(false);
    }
};


    const guardarVacuna = async (e) => {
    e.preventDefault();

    try {
        await api.post('/vacunas', {
            mascotaId: Number(mascotaId),
            nombreVacuna: formVacuna.nombreVacuna,
            fechaAplicacion: formVacuna.fechaAplicacion,
            fechaProximaDosis:
                formVacuna.fechaProximaDosis || null,
            productoId: formVacuna.productoId
                ? Number(formVacuna.productoId)
                : null
        });

        setModalVacuna(false);

        setFormVacuna({
            nombreVacuna: '',
            fechaAplicacion: '',
            fechaProximaDosis: '',
            productoId: ''
        });

        await cargarDatosIniciales();

        if (mascotaBuscada) {
            await buscarHistorialPorMascota(mascotaBuscada);
        }
    } catch (err) {
        setError(
            err.response?.data?.error ||
            'Error al guardar la vacuna.'
        );
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
        <PawPrint size={16} className="text-emerald-600" />
        Buscar mascota o propietario
    </label>

    <div className="relative">
        <div className="flex gap-3">
            <div className="relative flex-1">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    value={terminoBusqueda}
                    onChange={(e) => buscarMascotas(e.target.value)}
                    onFocus={() => {
                        if (resultadosBusqueda.length > 0) {
                            setMostrarResultados(true);
                        }
                    }}
                    placeholder="Ej: Zev o Miguel Guerrero..."
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>
        </div>

        {mostrarResultados && (
            <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                {resultadosBusqueda.length === 0 ? (
                    <div className="p-5 text-center text-gray-500 text-sm">
                        No se encontraron mascotas ni propietarios con ese nombre.
                    </div>
                ) : (
                    resultadosBusqueda.map((mascota) => (
                        <button
                            key={mascota.MascotaId}
                            type="button"
                            onClick={() => seleccionarMascota(mascota)}
                            className="w-full text-left px-5 py-4 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                                    <PawPrint
                                        size={19}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <div>
                                    <p className="font-extrabold text-gray-900">
                                        {mascota.Nombre}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Propietario:{' '}
                                        <span className="font-semibold text-gray-700">
                                            {obtenerNombrePropietarioMascota(mascota)}
                                        </span>
                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">
                                        {mascota.Especie || 'Especie no registrada'}
                                        {mascota.Raza
                                            ? ` · ${mascota.Raza}`
                                            : ''}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        )}
    </div>

    {cargando && (
        <p className="text-emerald-600 text-sm mt-3 font-medium">
            Cargando historial médico...
        </p>
    )}

    {error && (
        <p className="text-rose-500 text-sm mt-3 flex items-center gap-1.5 font-medium">
            <AlertTriangle size={16} />
            {error}
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
        onClick={() => {
            if (tabActiva === 'consultas') {
                navigate('/citas');
            } else {
                setModalVacuna(true);
            }
        }}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 mb-2"
    >
        <Plus size={18} />
        {tabActiva === 'consultas' ? 'Ir a Citas' : 'Registrar Vacuna'}
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