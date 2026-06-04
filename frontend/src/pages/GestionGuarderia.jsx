import { useEffect, useState } from 'react';
import api from '../services/api';


const GestionGuarderia = () => {
  const { usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rolId === 1;
  import { useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  const [espacios, setEspacios] = useState([]);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([]);
  const [ocupacion, setOcupacion] = useState([]);

  const [formEspacio, setFormEspacio] = useState({
    numeroEspacio: '',
    tipo: 'Pequeño',
    precioPorNoche: ''
  });

  const [formCheckIn, setFormCheckIn] = useState({
    mascotaId: '',
    espacioId: '',
    fechaEntrada: '',
    fechaSalidaEstimada: '',
    notasEspeciales: ''
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

  const handleEspacioChange = (e) => {
    setFormEspacio({
      ...formEspacio,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckInChange = (e) => {
    setFormCheckIn({
      ...formCheckIn,
      [e.target.name]: e.target.value
    });
  };

  const crearEspacio = async (e) => {
    e.preventDefault();

    try {
      await api.post('/guarderia/espacios', {
        numeroEspacio: formEspacio.numeroEspacio,
        tipo: formEspacio.tipo,
        precioPorNoche: Number(formEspacio.precioPorNoche)
      });

      alert('Espacio creado correctamente.');

      setFormEspacio({
        numeroEspacio: '',
        tipo: 'Pequeño',
        precioPorNoche: ''
      });

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

      setFormCheckIn({
        mascotaId: '',
        espacioId: '',
        fechaEntrada: '',
        fechaSalidaEstimada: '',
        notasEspeciales: ''
      });

      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al hacer check-in.');
    }
  };

  const hacerCheckOut = async (hospedajeId) => {
    const confirmar = confirm('¿Seguro que deseas hacer check-out de esta mascota?');

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
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Guardería</h1>
        <p className="text-gray-500">
          Administra espacios, check-in, check-out y ocupación del hotel de mascotas.
        </p>
      </div>

      {esAdmin && (
      <section className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Registrar espacio de hotel</h2>

        <form onSubmit={crearEspacio} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="numeroEspacio"
            placeholder="Número de espacio"
            value={formEspacio.numeroEspacio}
            onChange={handleEspacioChange}
            className="border rounded-lg px-3 py-2"
            required
          />

          <select
            name="tipo"
            value={formEspacio.tipo}
            onChange={handleEspacioChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="Pequeño">Pequeño</option>
            <option value="Mediano">Mediano</option>
            <option value="Grande">Grande</option>
          </select>

          <input
            type="number"
            name="precioPorNoche"
            placeholder="Precio por noche"
            value={formEspacio.precioPorNoche}
            onChange={handleEspacioChange}
            className="border rounded-lg px-3 py-2"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Guardar espacio
          </button>
        </form>
      </section>
      )}

      <section className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Hacer check-in</h2>

        <form onSubmit={hacerCheckIn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="mascotaId"
            placeholder="ID de la mascota"
            value={formCheckIn.mascotaId}
            onChange={handleCheckInChange}
            className="border rounded-lg px-3 py-2"
            required
          />

          <select
            name="espacioId"
            value={formCheckIn.espacioId}
            onChange={handleCheckInChange}
            className="border rounded-lg px-3 py-2"
            required
          >
            <option value="">Seleccione un espacio disponible</option>
            {espaciosDisponibles.map((espacio) => (
              <option key={espacio.EspacioId} value={espacio.EspacioId}>
                {espacio.NumeroEspacio} - {espacio.Tipo} - RD$ {espacio.PrecioPorNoche}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            name="fechaEntrada"
            value={formCheckIn.fechaEntrada}
            onChange={handleCheckInChange}
            className="border rounded-lg px-3 py-2"
            required
          />

          <input
            type="datetime-local"
            name="fechaSalidaEstimada"
            value={formCheckIn.fechaSalidaEstimada}
            onChange={handleCheckInChange}
            className="border rounded-lg px-3 py-2"
            required
          />

          <textarea
            name="notasEspeciales"
            placeholder="Notas especiales: dieta, medicación, alergias..."
            value={formCheckIn.notasEspeciales}
            onChange={handleCheckInChange}
            className="border rounded-lg px-3 py-2 md:col-span-2"
            rows="3"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 md:col-span-2"
          >
            Registrar check-in
          </button>
        </form>
      </section>

      <section className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Ocupación actual</h2>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Mascota</th>
                <th className="border px-3 py-2 text-left">Cliente</th>
                <th className="border px-3 py-2 text-left">Espacio</th>
                <th className="border px-3 py-2 text-left">Entrada</th>
                <th className="border px-3 py-2 text-left">Salida estimada</th>
                <th className="border px-3 py-2 text-left">Notas</th>
                <th className="border px-3 py-2 text-left">Acción</th>
              </tr>
            </thead>

            <tbody>
              {ocupacion.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No hay mascotas hospedadas actualmente.
                  </td>
                </tr>
              ) : (
                ocupacion.map((item) => (
                  <tr key={item.HospedajeId}>
                    <td className="border px-3 py-2">{item.NombreMascota}</td>
                    <td className="border px-3 py-2">{item.NombreCliente}</td>
                    <td className="border px-3 py-2">
                      {item.NumeroEspacio} - {item.Tipo}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(item.FechaEntrada).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(item.FechaSalidaEstimada).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2">
                      {item.NotasEspeciales || 'Sin notas'}
                    </td>
                    <td className="border px-3 py-2">
                      <button
                        onClick={() => hacerCheckOut(item.HospedajeId)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Check-out
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Espacios registrados</h2>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Número</th>
                <th className="border px-3 py-2 text-left">Tipo</th>
                <th className="border px-3 py-2 text-left">Precio</th>
                <th className="border px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>

            <tbody>
              {espacios.map((espacio) => (
                <tr key={espacio.EspacioId}>
                  <td className="border px-3 py-2">{espacio.NumeroEspacio}</td>
                  <td className="border px-3 py-2">{espacio.Tipo}</td>
                  <td className="border px-3 py-2">RD$ {espacio.PrecioPorNoche}</td>
                  <td className="border px-3 py-2">{espacio.Estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default GestionGuarderia;