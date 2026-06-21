/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, ShieldAlert, Plus, Edit2, X, Search } from 'lucide-react';

const GestionClientes = () => {
  const { usuario } = useContext(AuthContext);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    nombreCompleto: '',
    telefono: '',
    correo: '',
    direccion: ''
  });

  const cargarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch {
      setError('Error al cargar la lista de clientes');
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();
    return (
      cliente.NombreCompleto?.toLowerCase().includes(texto) ||
      cliente.Telefono?.toLowerCase().includes(texto) ||
      cliente.Correo?.toLowerCase().includes(texto) ||
      cliente.Direccion?.toLowerCase().includes(texto)
    );
  });

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({ id: null, nombreCompleto: '', telefono: '', correo: '', direccion: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (cliente) => {
    setModoEdicion(true);
    setFormData({
      id: cliente.ClienteId,
      nombreCompleto: cliente.NombreCompleto,
      telefono: cliente.Telefono,
      correo: cliente.Correo || '',
      direccion: cliente.Direccion || ''
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombreCompleto: formData.nombreCompleto,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion
      };

      if (modoEdicion) {
        await api.put(`/clientes/${formData.id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }

      setMostrarModal(false);
      cargarClientes();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar el cliente');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Users className="text-emerald-600" size={32} />
            Gestión de Clientes
          </h1>
          <p className="text-gray-500 mt-1">Administración de clientes de la clínica.</p>
        </div>

        {(usuario?.rolId === 1 || usuario?.rolId === 3) && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Plus size={20} />
            Nuevo Cliente
          </button>
        )}
      </div>

      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, correo o dirección..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
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
                <th className="py-4 px-6 font-semibold">Cliente</th>
                <th className="py-4 px-6 font-semibold">Teléfono</th>
                <th className="py-4 px-6 font-semibold">Dirección</th>
                {(usuario?.rolId === 1 || usuario?.rolId === 3) && (
                  <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.ClienteId} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{cliente.NombreCompleto}</span>
                      <span className="text-xs text-gray-500">{cliente.Correo || 'Sin correo'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-600">{cliente.Telefono}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{cliente.Direccion || 'No registrada'}</span>
                  </td>
                  {(usuario?.rolId === 1 || usuario?.rolId === 3) && (
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => abrirModalEditar(cliente)}
                        className="p-2 bg-white border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                        title="Editar Cliente"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 px-6 text-center text-gray-500">
                    {busqueda ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes registrados.'}
                  </td>
                </tr>
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
                {modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nombreCompleto}
                  onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
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

export default GestionClientes;