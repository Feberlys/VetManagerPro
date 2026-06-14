/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CalendarDays, ShieldAlert, Plus, Edit2, X, CheckCircle } from 'lucide-react';

const GestionCitas = () => {
  const { usuario } = useContext(AuthContext);
  const [citas, setCitas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroSemana, setFiltroSemana] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productos, setProductos] = useState([]);
  const [mostrarModalVacuna, setMostrarModalVacuna] = useState(false);
  const [citaVacuna, setCitaVacuna] = useState(null);

  const [vacunaData, setVacunaData] = useState({
  nombreVacuna: '',
  fechaAplicacion: '',
  fechaProximaDosis: '',
  productoId: ''
});

  const [formData, setFormData] = useState({
    id: null,
    mascotaId: '',
    veterinarioId: '',
    fechaHora: '',
    motivo: '',
    estadoCitaId: 1
  });

const cargarDatos = async () => {
  try {
    const [citasRes, mascotasRes, productosRes] = await Promise.all([
      api.get('/citas'),
      api.get('/mascotas'),
      api.get('/productos'),
    ]);

    setCitas(citasRes.data);
    setMascotas(mascotasRes.data);
    setProductos(productosRes.data);

    try {
      const usuariosRes = await api.get('/usuarios/veterinarios');
      setVeterinarios(usuariosRes.data);
    } catch {
      setVeterinarios([]);
    }
  } catch {
    setError('Error al cargar la información de citas');
  }
};

  useEffect(() => {
    cargarDatos();
  }, []);

  const citasFiltradas = citas.filter((cita) => {
  const fecha = new Date(cita.FechaHora);

  const coincideEstado =
    filtroEstado === 'todas' ||
    Number(cita.EstadoCitaId) === Number(filtroEstado);

  const coincideMes =
    filtroMes === '' ||
    fecha.getMonth() + 1 === Number(filtroMes);

  const coincideAnio =
    filtroAnio === '' ||
    fecha.getFullYear() === Number(filtroAnio);

  const semanaDelMes = Math.ceil(fecha.getDate() / 7);

  const coincideSemana =
    filtroSemana === '' ||
    semanaDelMes === Number(filtroSemana);

  return coincideEstado && coincideMes && coincideAnio && coincideSemana;
});

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({
      id: null,
      mascotaId: '',
      veterinarioId: '',
      fechaHora: '',
      motivo: '',
      estadoCitaId: 1
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (cita) => {
    setModoEdicion(true);

    setFormData({
      id: cita.CitaId,
      mascotaId: cita.MascotaId,
      veterinarioId: cita.VeterinarioId,
      fechaHora: cita.FechaHora ? cita.FechaHora.substring(0, 16) : '',
      motivo: cita.Motivo,
      estadoCitaId: cita.EstadoCitaId || 1
    });

    setMostrarModal(true);
  };

  const obtenerNombreMascota = (mascotaId) => {
    const mascota = mascotas.find((m) => Number(m.MascotaId) === Number(mascotaId));
    return mascota ? mascota.Nombre : 'Mascota no encontrada';
  };

  const obtenerNombreVeterinario = (veterinarioId) => {
    const vet = veterinarios.find((v) => Number(v.UsuarioId) === Number(veterinarioId));
    return vet ? vet.NombreCompleto : 'Veterinario no encontrado';
  };

  const obtenerNombreEstado = (estadoCitaId) => {
    switch (Number(estadoCitaId)) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'Atendida';
      case 3:
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const obtenerClaseEstado = (estadoCitaId) => {
    switch (Number(estadoCitaId)) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-emerald-100 text-emerald-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No registrada';

    return new Date(fecha).toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cambiarEstadoCita = async (citaId, estadoCitaId) => {
    try {
      await api.patch(`/citas/${citaId}/estado`, { estadoCitaId });
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar el estado de la cita');
    }
  };

  const limpiarFiltros = () => {
  setFiltroEstado('todas');
  setFiltroMes('');
  setFiltroAnio('');
  setFiltroSemana('');
};

const abrirModalVacuna = (cita) => {
  setCitaVacuna(cita);
  setVacunaData({
    nombreVacuna: '',
    fechaAplicacion: new Date().toISOString().substring(0, 10),
    fechaProximaDosis: '',
    productoId: ''
  });
  setMostrarModalVacuna(true);
};

const atenderSinVacuna = async () => {
  if (!citaVacuna) return;

  try {
    await api.patch(`/citas/${citaVacuna.CitaId}/estado`, { estadoCitaId: 2 });

    setMostrarModalVacuna(false);
    setCitaVacuna(null);
    cargarDatos();
  } catch (err) {
    alert(err.response?.data?.error || 'Error al marcar la cita como atendida');
  }
};

  const registrarVacunaYAtender = async (e) => {
  e.preventDefault();

  if (!citaVacuna) return;

  try {
    await api.post('/vacunas', {
      mascotaId: citaVacuna.MascotaId,
      nombreVacuna: vacunaData.nombreVacuna,
      fechaAplicacion: vacunaData.fechaAplicacion,
      fechaProximaDosis: vacunaData.fechaProximaDosis || null,
      productoId: vacunaData.productoId ? Number(vacunaData.productoId) : null
    });

    await api.patch(`/citas/${citaVacuna.CitaId}/estado`, { estadoCitaId: 2 });

    setMostrarModalVacuna(false);
    setCitaVacuna(null);
    cargarDatos();
  } catch (err) {
    alert(err.response?.data?.error || 'Error al registrar vacuna y atender la cita');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        mascotaId: Number(formData.mascotaId),
        veterinarioId: Number(formData.veterinarioId),
        fechaHora: formData.fechaHora,
        motivo: formData.motivo
      };

      if (modoEdicion) {
        await api.patch(`/citas/${formData.id}/reprogramar`, {
          fechaHora: formData.fechaHora
        });
      } else {
        await api.post('/citas', payload);
      }

      setMostrarModal(false);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la cita');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 bg-gray-50 min-h-screen relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <CalendarDays className="text-emerald-600" size={32} />
            Gestión de Citas
          </h1>
          <p className="text-gray-500 mt-1">Agenda de consultas y seguimiento de citas veterinarias.</p>
        </div>

        {(usuario?.rolId === 1 || usuario?.rolId === 2 || usuario?.rolId === 3) && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors"
          >
            <Plus size={20} />
            Nueva Cita
          </button>
        )}
      </div>

    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
    {[
      { valor: 'todas', texto: 'Todas', clase: 'bg-emerald-600' },
      { valor: '1', texto: 'Pendientes', clase: 'bg-yellow-500' },
      { valor: '2', texto: 'Atendidas', clase: 'bg-emerald-600' },
      { valor: '3', texto: 'Canceladas', clase: 'bg-red-600' }
    ].map((item) => (
      <button
        key={item.valor}
        onClick={() => setFiltroEstado(item.valor)}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
          filtroEstado === item.valor
            ? `${item.clase} text-white`
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {item.texto}
      </button>
    ))}
  </div>

  <div className="flex flex-wrap gap-3 items-center">

    <select
  value={filtroSemana}
  onChange={(e) => setFiltroSemana(e.target.value)}
  className="px-3 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Todas las semanas</option>
  <option value="1">Semana 1</option>
  <option value="2">Semana 2</option>
  <option value="3">Semana 3</option>
  <option value="4">Semana 4</option>
  <option value="5">Semana 5</option>
    </select>

    <select
      value={filtroMes}
      onChange={(e) => setFiltroMes(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">Todos los meses</option>
      <option value="1">Enero</option>
      <option value="2">Febrero</option>
      <option value="3">Marzo</option>
      <option value="4">Abril</option>
      <option value="5">Mayo</option>
      <option value="6">Junio</option>
      <option value="7">Julio</option>
      <option value="8">Agosto</option>
      <option value="9">Septiembre</option>
      <option value="10">Octubre</option>
      <option value="11">Noviembre</option>
      <option value="12">Diciembre</option>
    </select>

    <select
      value={filtroAnio}
      onChange={(e) => setFiltroAnio(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">Todos los años</option>
      <option value="2025">2025</option>
      <option value="2026">2026</option>
      <option value="2027">2027</option>
      <option value="2028">2028</option>
    </select>

    <button
      onClick={limpiarFiltros}
      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold"
    >
      Limpiar filtros
    </button>

    <span className="text-sm text-gray-500">
      Mostrando {citasFiltradas.length} de {citas.length} citas
    </span>

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
                <th className="py-4 px-6 font-semibold">Fecha y Hora</th>
                <th className="py-4 px-6 font-semibold">Mascota</th>
                <th className="py-4 px-6 font-semibold">Veterinario</th>
                <th className="py-4 px-6 font-semibold">Motivo</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {citasFiltradas.map((cita) => (
                <tr key={cita.CitaId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-gray-900">
                      {formatearFecha(cita.FechaHora)}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {cita.NombreMascota || obtenerNombreMascota(cita.MascotaId)}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {cita.NombreVeterinario || obtenerNombreVeterinario(cita.VeterinarioId)}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{cita.Motivo}</span>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${obtenerClaseEstado(
                        cita.EstadoCitaId
                      )}`}
                    >
                      {cita.NombreEstado || obtenerNombreEstado(cita.EstadoCitaId)}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(cita)}
                        disabled={Number(cita.EstadoCitaId) === 2 || Number(cita.EstadoCitaId) === 3}
                        className={`p-2 border rounded-lg transition-all ${
                          Number(cita.EstadoCitaId) === 2 || Number(cita.EstadoCitaId) === 3
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Reprogramar Cita"
                      >
                        <Edit2 size={16} />
                      </button>

                      {Number(cita.EstadoCitaId) === 1 && (
                        <>
                          <button
                            onClick={() => abrirModalVacuna(cita)}
                            className="p-2 bg-white border border-gray-300 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                            title="Marcar como Atendida"
                          >
                            <CheckCircle size={16} />
                          </button>

                          <button
                            onClick={() => cambiarEstadoCita(cita.CitaId, 3)}
                            className="p-2 bg-white border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                            title="Cancelar Cita"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {citasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-gray-500">
                    No hay citas para el filtro seleccionado.
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
                {modoEdicion ? 'Reprogramar Cita' : 'Nueva Cita'}
              </h2>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mascota</label>
                <select
                  required
                  disabled={modoEdicion}
                  value={formData.mascotaId}
                  onChange={(e) => setFormData({ ...formData, mascotaId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccione una mascota</option>
                  {mascotas.map((mascota) => (
                    <option key={mascota.MascotaId} value={mascota.MascotaId}>
                      {mascota.Nombre} - {mascota.Especie}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Veterinario</label>
                <select
                  required
                  disabled={modoEdicion}
                  value={formData.veterinarioId}
                  onChange={(e) => setFormData({ ...formData, veterinarioId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccione un veterinario</option>
                  {veterinarios.map((vet) => (
                    <option key={vet.UsuarioId} value={vet.UsuarioId}>
                      {vet.NombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.fechaHora}
                  onChange={(e) => setFormData({ ...formData, fechaHora: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo</label>
                <textarea
                  required
                  disabled={modoEdicion}
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                />
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
                  {modoEdicion ? 'Reprogramar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {mostrarModalVacuna && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Atender Cita</h2>
        <button
          onClick={() => setMostrarModalVacuna(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={registrarVacunaYAtender} className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Puedes registrar una vacuna aplicada antes de marcar la cita como atendida.
        </p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre de la vacuna
          </label>
          <input
            type="text"
            value={vacunaData.nombreVacuna}
            onChange={(e) => setVacunaData({ ...vacunaData, nombreVacuna: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Ej: Rabia, Parvovirus, Moquillo"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha aplicación
            </label>
            <input
              type="date"
              value={vacunaData.fechaAplicacion}
              onChange={(e) => setVacunaData({ ...vacunaData, fechaAplicacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Próxima dosis
            </label>
            <input
              type="date"
              value={vacunaData.fechaProximaDosis}
              onChange={(e) => setVacunaData({ ...vacunaData, fechaProximaDosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Producto usado
          </label>
          <select
            value={vacunaData.productoId}
            onChange={(e) => setVacunaData({ ...vacunaData, productoId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Sin producto asociado</option>
            {productos.map((producto) => (
              <option key={producto.ProductoId} value={producto.ProductoId}>
                {producto.Nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setMostrarModalVacuna(false)}
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={atenderSinVacuna}
            className="w-full py-2.5 px-4 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Atender sin vacuna
          </button>

          <button
            type="submit"
            disabled={!vacunaData.nombreVacuna || !vacunaData.fechaAplicacion}
            className="w-full py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Registrar vacuna y atender
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default GestionCitas;