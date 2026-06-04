const citaModel = require('../models/citaModel');

const listarCitas = async (req, res) => {
  try {
    const citas = await citaModel.obtenerCitas();
    res.status(200).json(citas);
  } catch (error) {
    console.error('Error al listar citas:', error);
    res.status(500).json({ error: 'Hubo un error al obtener las citas' });
  }
};

const obtenerCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await citaModel.obtenerCitaPorId(id);

    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.status(200).json(cita);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({ error: 'Hubo un error al obtener la cita' });
  }
};

const listarCitasPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    const citas = await citaModel.obtenerCitasPorFecha(fecha);
    res.status(200).json(citas);
  } catch (error) {
    console.error('Error al listar citas por fecha:', error);
    res.status(500).json({ error: 'Hubo un error al obtener la agenda' });
  }
};

const listarCitasPorMascota = async (req, res) => {
  try {
    const { mascotaId } = req.params;
    const citas = await citaModel.obtenerCitasPorMascota(mascotaId);
    res.status(200).json(citas);
  } catch (error) {
    console.error('Error al listar citas por mascota:', error);
    res.status(500).json({ error: 'Hubo un error al obtener las citas de la mascota' });
  }
};

const listarEstadosCita = async (req, res) => {
  try {
    const estados = await citaModel.obtenerEstadosCita();
    res.status(200).json(estados);
  } catch (error) {
    console.error('Error al listar estados de cita:', error);
    res.status(500).json({ error: 'Hubo un error al obtener los estados de cita' });
  }
};

const crearCita = async (req, res) => {
  try {
    const { mascotaId, veterinarioId, fechaHora, motivo } = req.body;

    if (!mascotaId || !veterinarioId || !fechaHora || !motivo) {
      return res.status(400).json({
        error: 'Mascota, veterinario, fecha/hora y motivo son obligatorios'
      });
    }

    const creada = await citaModel.crearCita({
      mascotaId,
      veterinarioId,
      fechaHora,
      motivo
    });

    res.status(201).json({ mensaje: 'Cita creada exitosamente', citaId: creada.CitaId });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      error: error.message || 'Hubo un error al crear la cita'
    });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoCitaId } = req.body;

    if (!estadoCitaId) {
      return res.status(400).json({ error: 'El estado de la cita es obligatorio' });
    }

    const actualizado = await citaModel.cambiarEstadoCita(id, estadoCitaId);

    if (actualizado) {
      res.status(200).json({ mensaje: 'Estado de cita actualizado con éxito' });
    } else {
      res.status(404).json({ error: 'Cita no encontrada' });
    }
  } catch (error) {
    console.error('Error al cambiar estado de cita:', error);
    res.status(500).json({ error: 'Hubo un error al cambiar el estado de la cita' });
  }
};

const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cancelada = await citaModel.cambiarEstadoCita(id, 3);

    if (cancelada) {
      res.status(200).json({ mensaje: 'Cita cancelada con éxito' });
    } else {
      res.status(404).json({ error: 'Cita no encontrada' });
    }
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ error: 'Hubo un error al cancelar la cita' });
  }
};

const reprogramarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaHora } = req.body;

    if (!fechaHora) {
      return res.status(400).json({ error: 'La nueva fecha y hora es obligatoria' });
    }

    const reprogramada = await citaModel.reprogramarCita(id, fechaHora);

    if (reprogramada) {
      res.status(200).json({ mensaje: 'Cita reprogramada con éxito' });
    } else {
      res.status(404).json({ error: 'Cita no encontrada' });
    }
  } catch (error) {
    console.error('Error al reprogramar cita:', error);
    res.status(500).json({
      error: error.message || 'Hubo un error al reprogramar la cita'
    });
  }
};

module.exports = {
  listarCitas,
  obtenerCita,
  listarCitasPorFecha,
  listarCitasPorMascota,
  listarEstadosCita,
  crearCita,
  cambiarEstado,
  cancelarCita,
  reprogramarCita
};