import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    LayoutDashboard, 
    PawPrint, 
    CalendarClock, 
    Home, 
    AlertTriangle,
    Package,
    Users
} from 'lucide-react';

const Dashboard = () => {
    const { usuario } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    
    const [stats, setStats] = useState({
        totalMascotas: 0,
        citasHoy: 0,
        ocupacionGuarderia: 0,
        productosBajoStock: 0
    });

    const [proximasCitas, setProximasCitas] = useState([]);

    useEffect(() => {
        cargarDatosDashboard();
    }, []);

    const cargarDatosDashboard = async () => {
        try {
            const [resMascotas, resCitas, resGuarderia, resProductos] = await Promise.allSettled([
                api.get('/mascotas'),
                api.get('/citas'), 
                api.get('/guarderia/ocupacion'),
                api.get('/productos')
            ]);

            const mascotas = resMascotas.status === 'fulfilled' ? resMascotas.value.data : [];
            const citas = resCitas.status === 'fulfilled' ? resCitas.value.data : [];
            const ocupacion = resGuarderia.status === 'fulfilled' ? resGuarderia.value.data.data || [] : [];
            const productos = resProductos.status === 'fulfilled' ? resProductos.value.data : [];

            // CORRECCIÓN 1: Buscar FechaHora en lugar de Fecha
            const citasDeHoy = citas.filter(cita => {
                if (!cita.FechaHora) return false;
                const fechaCita = new Date(cita.FechaHora).toDateString();
                const hoy = new Date().toDateString();
                return fechaCita === hoy;
            });

            const bajoStock = productos.filter(p => p.Stock <= (p.StockMinimo || 5));

            setStats({
                totalMascotas: mascotas.length || 0,
                citasHoy: citasDeHoy.length || 0,
                ocupacionGuarderia: ocupacion.length || 0,
                productosBajoStock: bajoStock.length || 0
            });

            // Filtramos para asegurar que mostramos citas recientes/próximas y tomamos las primeras 5
            const citasOrdenadas = citas
                .filter(c => c.FechaHora && new Date(c.FechaHora) >= new Date(new Date().setHours(0,0,0,0)))
                .sort((a, b) => new Date(a.FechaHora) - new Date(b.FechaHora))
                .slice(0, 5);

            setProximasCitas(citasOrdenadas.length > 0 ? citasOrdenadas : citas.slice(0, 5));

        } catch (error) {
            console.error("Error cargando el dashboard:", error);
        } finally {
            setCargando(false);
        }
    };

    const obtenerTextoRol = (rolId) => {
        switch(rolId) {
            case 1: return 'Administrador';
            case 2: return 'Veterinario';
            case 3: return 'Recepcionista';
            default: return 'Personal';
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'Por asignar';
        return new Date(fecha).toLocaleString('es-DO', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const TarjetaStat = ({ titulo, valor, icono: Icono, color, alerta }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
            <div className={`p-4 rounded-xl ${color}`}>
                <Icono size={28} className="text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{titulo}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-extrabold text-gray-800">{valor}</h3>
                    {alerta && valor > 0 && (
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    if (cargando) {
        return <div className="flex items-center justify-center h-screen text-emerald-600 font-bold">Cargando métricas...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen">
            
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <LayoutDashboard className="text-emerald-600" size={32} />
                    Panel de Control
                </h1>
                <p className="text-gray-500 mt-1">
                    Hola de nuevo, <span className="font-semibold text-emerald-700">{obtenerTextoRol(usuario?.rolId)}</span>. Aquí está el resumen de VetManager.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <TarjetaStat 
                    titulo="Pacientes Registrados" 
                    valor={stats.totalMascotas} 
                    icono={PawPrint} 
                    color="bg-emerald-500" 
                />
                <TarjetaStat 
                    titulo="Citas para Hoy" 
                    valor={stats.citasHoy} 
                    icono={CalendarClock} 
                    color="bg-blue-500" 
                />
                <TarjetaStat 
                    titulo="Mascotas en Guardería" 
                    valor={stats.ocupacionGuarderia} 
                    icono={Home} 
                    color="bg-purple-500" 
                />
                <TarjetaStat 
                    titulo="Alertas de Inventario" 
                    valor={stats.productosBajoStock} 
                    icono={AlertTriangle} 
                    color="bg-rose-500" 
                    alerta={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Próximas Citas</h2>
                        <button 
                            onClick={() => navigate('/citas')} 
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            Ver todas
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                    <th className="pb-3 font-semibold">Paciente</th>
                                    <th className="pb-3 font-semibold">Motivo</th>
                                    <th className="pb-3 font-semibold">Fecha/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {proximasCitas.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-6 text-center text-gray-500 text-sm">
                                            No hay citas programadas recientemente.
                                        </td>
                                    </tr>
                                ) : (
                                    proximasCitas.map((cita, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 text-sm font-bold text-gray-800">{cita.NombreMascota || 'Desconocido'}</td>
                                            <td className="py-3 text-sm text-gray-600">{cita.Motivo || 'Consulta general'}</td>
                                            {/* CORRECCIÓN 2: Mostrar la FechaHora con el formato correcto */}
                                            <td className="py-3 text-sm font-medium text-emerald-600">
                                                {formatearFecha(cita.FechaHora)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl shadow-md p-6 text-white">
                    <h2 className="text-lg font-bold mb-6 text-emerald-50">Accesos Rápidos</h2>
                    <div className="space-y-3">
                        <button 
                            onClick={() => navigate('/citas')}
                            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm active:scale-95"
                        >
                            <span className="flex items-center gap-3 font-medium"><CalendarClock size={18} /> Nueva Cita</span>
                        </button>
                        <button 
                            onClick={() => navigate('/guarderia')}
                            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm active:scale-95"
                        >
                            <span className="flex items-center gap-3 font-medium"><Home size={18} /> Ingresar a Guardería</span>
                        </button>
                        <button 
                            onClick={() => navigate('/inventario')}
                            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all backdrop-blur-sm active:scale-95"
                        >
                            <span className="flex items-center gap-3 font-medium"><Package size={18} /> Registrar Producto</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;