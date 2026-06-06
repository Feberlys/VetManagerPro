/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PawPrint, ShieldAlert, Plus, Edit2, X, Search } from 'lucide-react';

const GestionMascotas = () => {
  const { usuario } = useContext(AuthContext);
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    clienteId: '',
    nombre: '',
    especie: '',
    raza: '',
    fechaNacimiento: '',
    sexo: 'M',
    peso: ''
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

    return (
      mascota.Nombre?.toLowerCase().includes(texto) ||
      mascota.Especie?.toLowerCase().includes(texto) ||
      mascota.Raza?.toLowerCase().includes(texto) ||
      nombreCliente?.toLowerCase().includes(texto)
    );
  });

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({
      id: null,
      clienteId: '',
      nombre: '',
      especie: '',
      raza: '',
      fechaNacimiento: '',
      sexo: 'M',
      peso: ''
    });
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
      alert(err.response?.data?.error || 'Error al guardar la mascota');
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
          <p className="text-gray-500 mt-1">Registro y edición de mascotas asociadas a clientes.</p>
        </div>

        {(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
          >
            <Plus size={20} />
            Nueva Mascota
          </button>
        )}
      </div>

      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar mascota, especie, raza o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
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
                <th className="py-4 px-6 font-semibold">Mascota</th>
                <th className="py-4 px-6 font-semibold">Cliente</th>
                <th className="py-4 px-6 font-semibold">Sexo</th>
                <th className="py-4 px-6 font-semibold">Peso</th>
                <th className="py-4 px-6 font-semibold">Nacimiento</th>
                {(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
                  <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {mascotasFiltradas.map((mascota) => (
                <tr key={mascota.MascotaId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{mascota.Nombre}</span>
                      <span className="text-xs text-gray-500">
                        {mascota.Especie} {mascota.Raza ? `- ${mascota.Raza}` : ''}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {mascota.NombreCliente || obtenerNombreCliente(mascota.ClienteId)}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-600">
                      {mascota.Sexo === 'M' ? 'Macho' : 'Hembra'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">
                      {mascota.Peso ? `${mascota.Peso} kg` : 'No registrado'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">
                      {mascota.FechaNacimiento ? mascota.FechaNacimiento.substring(0, 10) : 'No registrada'}
                    </span>
                  </td>

                  {(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => abrirModalEditar(mascota)}
                        className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
                        title="Editar Mascota"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {mascotasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-gray-500">
                    {busqueda ? 'No se encontraron mascotas con esa búsqueda.' : 'No hay mascotas registradas.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {modoEdicion ? 'Editar Mascota' : 'Nueva Mascota'}
              </h2>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
                <select
                  required
                  value={formData.clienteId}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.ClienteId} value={cliente.ClienteId}>
                      {cliente.NombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Especie</label>
                  <input
                    type="text"
                    required
                    value={formData.especie}
                    onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                    placeholder="Perro, Gato..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Raza</label>
                <input
                  type="text"
                  value={formData.raza}
                  onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
                  </select>
                </div>

                <div className="w-1/3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Peso</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="w-1/3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="w-1/2 py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMascotas;