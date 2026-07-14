/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PawPrint, ShieldAlert, Plus, Edit2, X, Search } from 'lucide-react';

const CATALOGO_ANIMALES = {
  "Perro": ["Mestizo", "Labrador", "Bulldog", "Poodle", "Chihuahua", "Golden Retriever", "Schnauzer", "Yorkshire", "Pug", "Husky", "Otro"],
  "Gato": ["Mestizo", "Siamés", "Persa", "Angora", "Maine Coon", "Bengalí", "Sphynx", "Otro"],
  "Ave": ["Canario", "Periquito", "Loro", "Cacatúa", "Ninfa", "Otro"],
  "Roedor": ["Hámster", "Cuyo/Cobaya", "Conejo", "Chinchilla", "Otro"],
  "Reptil": ["Iguana", "Tortuga", "Serpiente", "Gecko", "Otro"],
  "Otro": ["Otro"]
};

const GestionMascotas = () => {
  const { usuario } = useContext(AuthContext);
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mascotaEstadoPendiente, setMascotaEstadoPendiente] = useState(null);

  const [formData, setFormData] = useState({
    id: null, clienteId: '', nombre: '', especie: '', raza: '', fechaNacimiento: '', sexo: 'M', peso: ''
  });

  const cargarDatos = async () => {
    try {
      const [mascotasRes, clientesRes] = await Promise.all([
        api.get('/mascotas'),
        api.get('/clientes')
      ]);
      setMascotas(mascotasRes.data);
      setClientes(clientesRes.data);
    } catch {
      setError('Error al cargar la información de mascotas');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const obtenerNombreCliente = (clienteId) => {
    const cliente = clientes.find((c) => Number(c.ClienteId) === Number(clienteId));
    return cliente ? cliente.NombreCompleto : 'Cliente no encontrado';
  };

  const mascotasFiltradas = mascotas.filter((mascota) => {
  const texto = busqueda.toLowerCase();
  const nombreCliente = mascota.NombreCliente || obtenerNombreCliente(mascota.ClienteId);

  const coincideBusqueda =
    mascota.Nombre?.toLowerCase().includes(texto) ||
    mascota.Especie?.toLowerCase().includes(texto) ||
    mascota.Raza?.toLowerCase().includes(texto) ||
    nombreCliente?.toLowerCase().includes(texto);

  const estaActiva = mascota.Estado === true || mascota.Estado === 1;

  const coincideEstado =
    filtroEstado === 'todos' ||
    (filtroEstado === 'activos' && estaActiva) ||
    (filtroEstado === 'inactivos' && !estaActiva);

  return coincideBusqueda && coincideEstado;
});

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({ id: null, clienteId: '', nombre: '', especie: '', raza: '', fechaNacimiento: '', sexo: 'M', peso: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (mascota) => {
    setModoEdicion(true);
    setFormData({
      id: mascota.MascotaId,
      clienteId: mascota.ClienteId,
      nombre: mascota.Nombre,
      especie: mascota.Especie,
      raza: mascota.Raza || '',
      fechaNacimiento: mascota.FechaNacimiento ? mascota.FechaNacimiento.substring(0, 10) : '',
      sexo: mascota.Sexo || 'M',
      peso: mascota.Peso || ''
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        clienteId: Number(formData.clienteId),
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza,
        fechaNacimiento: formData.fechaNacimiento || null,
        sexo: formData.sexo,
        peso: formData.peso ? Number(formData.peso) : null
      };

      if (modoEdicion) {
        await api.put(`/mascotas/${formData.id}`, payload);
      } else {
        await api.post('/mascotas', payload);
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (err) {
  setError(
    err.response?.data?.error ||
    'Error al guardar la mascota'
  );
}
  };

  const solicitarCambioEstadoMascota = (mascota) => {
  const estaActiva = mascota.Estado === true || mascota.Estado === 1;

  setMascotaEstadoPendiente({
    mascota,
    nuevoEstado: !estaActiva
  });
};

  const confirmarCambioEstadoMascota = async () => {
  if (!mascotaEstadoPendiente) return;

  const { mascota, nuevoEstado } = mascotaEstadoPendiente;

  try {
    await api.patch(`/mascotas/${mascota.MascotaId}/estado`, {
      estado: nuevoEstado
    });

    setMascotaEstadoPendiente(null);
    await cargarDatos();
  } catch (err) {
    setMascotaEstadoPendiente(null);
    setError(
      err.response?.data?.error ||
      'Error al cambiar el estado de la mascota'
    );
  }
};

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <PawPrint className="text-emerald-600" size={32} />
            Gestión de Mascotas
          </h1>
          <p className="text-gray-500 mt-1">Registro y edición de pacientes asociados a clientes.</p>
        </div>

        {(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Plus size={20} />
            Nueva Mascota
          </button>
        )}
      </div>

      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
  <div className="relative max-w-md">
    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
    <input
      type="text"
      placeholder="Buscar mascota, especie, raza o cliente..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
    />
  </div>

  <div className="flex flex-wrap gap-2">
    {[
      { valor: 'activos', texto: 'Activas' },
      { valor: 'inactivos', texto: 'Inactivas' },
      { valor: 'todos', texto: 'Todas' }
    ].map((item) => (
      <button
        key={item.valor}
        type="button"
        onClick={() => setFiltroEstado(item.valor)}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
          filtroEstado === item.valor
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {item.texto}
      </button>
    ))}

    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 ml-auto">
      Mostrando {mascotasFiltradas.length} de {mascotas.length} mascotas
    </span>
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
                <th className="py-4 px-6 font-semibold">Mascota</th>
                <th className="py-4 px-6 font-semibold">Cliente</th>
                <th className="py-4 px-6 font-semibold">Sexo</th>
                <th className="py-4 px-6 font-semibold">Peso</th>
                <th className="py-4 px-6 font-semibold">Nacimiento</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
                 {(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
                  <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mascotasFiltradas.map((mascota) => (
                <tr key={mascota.MascotaId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{mascota.Nombre}</span>
                      <span className="text-xs text-gray-500">
                        {mascota.Especie} {mascota.Raza ? `- ${mascota.Raza}` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-600">
                      {mascota.NombreCliente || obtenerNombreCliente(mascota.ClienteId)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${mascota.Sexo === 'M' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'}`}>
                      {mascota.Sexo === 'M' ? 'Macho' : 'Hembra'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">
                      {mascota.Peso ? `${mascota.Peso} kg` : '---'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
  <span className="text-sm text-gray-500">
    {mascota.FechaNacimiento ? mascota.FechaNacimiento.substring(0, 10) : '---'}
  </span>
</td>

<td className="py-4 px-6">
  {(mascota.Estado === true || mascota.Estado === 1) ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      Activa
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
      Inactiva
    </span>
  )}
</td>

{(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
                    <td className="py-4 px-6 text-right">
  <div className="flex justify-end gap-2">
    <button
      onClick={() => abrirModalEditar(mascota)}
      className="p-2 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
      title="Editar Mascota"
    >
      <Edit2 size={16} />
    </button>

    <button
      onClick={() => solicitarCambioEstadoMascota(mascota)}
      className={`px-3 py-2 border rounded-lg text-xs font-bold transition-all shadow-sm ${
        mascota.Estado === true || mascota.Estado === 1
          ? 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'
          : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'
      }`}
      title={
        mascota.Estado === true || mascota.Estado === 1
          ? 'Inactivar Mascota'
          : 'Activar Mascota'
      }
    >
      {mascota.Estado === true || mascota.Estado === 1
        ? 'Inactivar'
        : 'Activar'}
    </button>
  </div>
</td>
                  )}
                </tr>
              ))}
              {mascotasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 px-6 text-center text-gray-500">
  {busqueda
    ? 'No se encontraron mascotas con esa búsqueda.'
    : 'No hay mascotas para el filtro seleccionado.'}
</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

            {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-800">
                {modoEdicion ? 'Editar Mascota' : 'Nueva Mascota'}
              </h2>

              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cliente Dueño
                </label>
                <select
                  required
                  value={formData.clienteId}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.ClienteId} value={cliente.ClienteId}>
                      {cliente.NombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Especie
                  </label>
                  <select
                    required
                    value={formData.especie}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        especie: e.target.value,
                        raza: ''
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">Seleccione especie</option>
                    {Object.keys(CATALOGO_ANIMALES).map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Raza
                  </label>
                  <select
                    required
                    disabled={!formData.especie}
                    value={formData.raza}
                    onChange={(e) =>
                      setFormData({ ...formData, raza: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                  >
                    <option value="">Seleccione raza</option>
                    {formData.especie &&
                      CATALOGO_ANIMALES[formData.especie].map((raza) => (
                        <option key={raza} value={raza}>
                          {raza}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sexo
                  </label>
                  <select
                    value={formData.sexo}
                    onChange={(e) =>
                      setFormData({ ...formData, sexo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) =>
                      setFormData({ ...formData, peso: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fechaNacimiento: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mascotaEstadoPendiente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-800">
                {mascotaEstadoPendiente.nuevoEstado
                  ? 'Activar mascota'
                  : 'Inactivar mascota'}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Confirma la acción antes de continuar.
              </p>
            </div>

            <div className="p-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                {mascotaEstadoPendiente.nuevoEstado
                  ? '¿Deseas activar a la mascota '
                  : '¿Deseas inactivar a la mascota '}
                <span className="font-bold text-gray-900">
                  {mascotaEstadoPendiente.mascota.Nombre}
                </span>
                ?
              </p>

              {!mascotaEstadoPendiente.nuevoEstado && (
                <div className="mt-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl p-4 text-sm">
                  La mascota no se eliminará. Solo quedará marcada como inactiva y podrás activarla nuevamente desde el filtro de inactivas.
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                type="button"
                onClick={() => setMascotaEstadoPendiente(null)}
                className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarCambioEstadoMascota}
                className={`w-1/2 py-2.5 px-4 text-white font-bold rounded-xl transition-all shadow-sm ${
                  mascotaEstadoPendiente.nuevoEstado
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {mascotaEstadoPendiente.nuevoEstado ? 'Activar' : 'Inactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMascotas;