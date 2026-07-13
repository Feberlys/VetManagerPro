import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Home, BedDouble, LogIn, LogOut, Info } from 'lucide-react';

const GestionGuarderia = () => {
  const { usuario } = useContext(AuthContext);
  const esAdmin = [1, 2].includes(usuario?.rolId); // Mantenemos el acceso a vet/admin
  
  const [espacios, setEspacios] = useState([]);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([]);
  const [ocupacion, setOcupacion] = useState([]);

  const [formEspacio, setFormEspacio] = useState({
    numeroEspacio: '', tipo: 'Pequeño', precioPorNoche: ''
  });

  const [formCheckIn, setFormCheckIn] = useState({
    mascotaId: '', espacioId: '', fechaEntrada: '', fechaSalidaEstimada: '', notasEspeciales: ''
  });

  const cargarDatos = async () => {
    try {
      const [resEspacios, resDisponibles, resOcupacion] = await Promise.all([
        api.get('/guarderia/espacios'),
        api.get('/guarderia/espacios/disponibles'),
        api.get('/guarderia/ocupacion')
      ]);
      setEspacios(resEspacios.data.data || []);
      setEspaciosDisponibles(resDisponibles.data.data || []);
      setOcupacion(resOcupacion.data.data || []);
    } catch (error) {
      console.error(error);
      alert('Error al cargar los datos de guardería.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEspacioChange = (e) => setFormEspacio({ ...formEspacio, [e.target.name]: e.target.value });
  const handleCheckInChange = (e) => setFormCheckIn({ ...formCheckIn, [e.target.name]: e.target.value });

  const crearEspacio = async (e) => {
    e.preventDefault();
    try {
      await api.post('/guarderia/espacios', {
        numeroEspacio: formEspacio.numeroEspacio,
        tipo: formEspacio.tipo,
        precioPorNoche: Number(formEspacio.precioPorNoche)
      });
      alert('Espacio creado correctamente.');
      setFormEspacio({ numeroEspacio: '', tipo: 'Pequeño', precioPorNoche: '' });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al crear el espacio.');
    }
  };

  const hacerCheckIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/guarderia/checkin', {
        mascotaId: Number(formCheckIn.mascotaId),
        espacioId: Number(formCheckIn.espacioId),
        fechaEntrada: formCheckIn.fechaEntrada,
        fechaSalidaEstimada: formCheckIn.fechaSalidaEstimada,
        notasEspeciales: formCheckIn.notasEspeciales
      });
      alert('Check-in realizado correctamente.');
      setFormCheckIn({ mascotaId: '', espacioId: '', fechaEntrada: '', fechaSalidaEstimada: '', notasEspeciales: '' });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al hacer check-in.');
    }
  };

  const hacerCheckOut = async (hospedajeId) => {
    const confirmar = window.confirm('¿Seguro que deseas hacer check-out de esta mascota?');
    if (!confirmar) return;
    try {
      const res = await api.put(`/guarderia/checkout/${hospedajeId}`);
      alert(`Check-out realizado. Total a cobrar: RD$ ${res.data.data.totalCobrar}`);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al hacer check-out.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative space-y-8">
      
      {/* Encabezado Estandarizado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Home className="text-emerald-600" size={32} />
            Gestión de Guardería
          </h1>
          <p className="text-gray-500 mt-1">Administra espacios, check-in, check-out y ocupación del hotel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Formularios (Ocupa 1 tercio en PC) */}
        <div className="space-y-8">
          
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <LogIn className="text-emerald-600" size={20} /> Hacer Check-in
            </h2>
            <form onSubmit={hacerCheckIn} className="space-y-4">
              <input type="number" name="mascotaId" placeholder="ID de la mascota" value={formCheckIn.mascotaId} onChange={handleCheckInChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              <select name="espacioId" value={formCheckIn.espacioId} onChange={handleCheckInChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all">
                <option value="">Seleccione un espacio disponible</option>
                {espaciosDisponibles.map((espacio) => (
                  <option key={espacio.EspacioId} value={espacio.EspacioId}>{espacio.NumeroEspacio} - {espacio.Tipo} - RD${espacio.PrecioPorNoche}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha de Entrada</label>
                <input type="datetime-local" name="fechaEntrada" value={formCheckIn.fechaEntrada} onChange={handleCheckInChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Salida Estimada</label>
                <input type="datetime-local" name="fechaSalidaEstimada" value={formCheckIn.fechaSalidaEstimada} onChange={handleCheckInChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <textarea name="notasEspeciales" placeholder="Notas especiales: dieta, alergias..." value={formCheckIn.notasEspeciales} onChange={handleCheckInChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 outline-none transition-all text-sm" />
              <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">
                Registrar Check-in
              </button>
            </form>
          </section>

          {usuario?.rolId === 1 && (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <BedDouble className="text-emerald-600" size={20} /> Registrar Espacio
              </h2>
              <form onSubmit={crearEspacio} className="space-y-4">
                <input type="text" name="numeroEspacio" placeholder="Número (ej. H-10)" value={formEspacio.numeroEspacio} onChange={handleEspacioChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 outline-none" />
                <select name="tipo" value={formEspacio.tipo} onChange={handleEspacioChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 outline-none">
                  <option value="Pequeño">Pequeño</option><option value="Mediano">Mediano</option><option value="Grande">Grande</option>
                </select>
                <input type="number" name="precioPorNoche" placeholder="Precio por noche (RD$)" value={formEspacio.precioPorNoche} onChange={handleEspacioChange} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 outline-none" />
                <button type="submit" className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl shadow-sm hover:bg-slate-900 transition-colors">
                  Guardar Espacio
                </button>
              </form>
            </section>
          )}

        </div>

        {/* Columna Derecha: Tablas (Ocupa 2 tercios en PC) */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Info className="text-emerald-600" size={20} /> Ocupación Actual
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Mascota / Cliente</th>
                    <th className="py-3 px-4 font-semibold">Espacio</th>
                    <th className="py-3 px-4 font-semibold">Fechas</th>
                    <th className="py-3 px-4 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ocupacion.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-6 text-gray-500 text-sm">No hay mascotas hospedadas actualmente.</td></tr>
                  ) : (
                    ocupacion.map((item) => (
                      <tr key={item.HospedajeId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{item.NombreMascota}</span>
                            <span className="text-xs text-gray-500">{item.NombreCliente}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {item.NumeroEspacio} - {item.Tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-xs text-gray-500">
                            <span><strong className="text-gray-700">Ent:</strong> {new Date(item.FechaEntrada).toLocaleDateString()}</span>
                            <span><strong className="text-gray-700">Sal:</strong> {new Date(item.FechaSalidaEstimada).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => hacerCheckOut(item.HospedajeId)} className="flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-rose-600 hover:text-white transition-colors ml-auto shadow-sm">
                            <LogOut size={16} /> Check-out
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Inventario de Espacios</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Número</th>
                    <th className="py-3 px-4 font-semibold">Tipo</th>
                    <th className="py-3 px-4 font-semibold">Precio / Noche</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {espacios.map((espacio) => (
                    <tr key={espacio.EspacioId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{espacio.NumeroEspacio}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{espacio.Tipo}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">RD$ {espacio.PrecioPorNoche}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${espacio.Estado === 'Disponible' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {espacio.Estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default GestionGuarderia;