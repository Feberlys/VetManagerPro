const mascotaModel = require('../models/mascotaModel');

const listarMascotas = async (req, res) => {
  try {
    const mascotas = await mascotaModel.obtenerMascotas();
    res.status(200).json(mascotas);
  } catch (error) {
    console.error('Error al listar mascotas:', error);
    res.status(500).json({ error: 'Hubo un error al obtener las mascotas' });
  }
};

const obtenerMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const mascota = await mascotaModel.obtenerMascotaPorId(id);

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.status(200).json(mascota);
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    res.status(500).json({ error: 'Hubo un error al obtener la mascota' });
  }
};

const listarMascotasPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const mascotas = await mascotaModel.obtenerMascotasPorCliente(clienteId);
    res.status(200).json(mascotas);
  } catch (error) {
    console.error('Error al listar mascotas por cliente:', error);
    res.status(500).json({ error: 'Hubo un error al obtener las mascotas del cliente' });
  }
};

const buscarMascotas = async (req, res) => {
  try {
    const { nombre } = req.query;
    const mascotas = await mascotaModel.buscarMascotas(nombre || '');
    res.status(200).json(mascotas);
  } catch (error) {
    console.error('Error al buscar mascotas:', error);
    res.status(500).json({ error: 'Hubo un error al buscar mascotas' });
  }
};

const crearMascota = async (req, res) => {
  try {
    const { clienteId, nombre, especie, raza, fechaNacimiento, sexo, peso } = req.body;

    if (!clienteId || !nombre || !especie) {
      return res.status(400).json({ error: 'Cliente, nombre y especie son obligatorios' });
    }

    const creada = await mascotaModel.crearMascota({
      clienteId,
      nombre,
      especie,
      raza,
      fechaNacimiento,
      sexo,
      peso
    });

    res.status(201).json({ mensaje: 'Mascota creada exitosamente', mascotaId: creada.MascotaId });
  } catch (error) {
    console.error('Error al crear mascota:', error);
    res.status(500).json({ error: error.message || 'Hubo un error al crear la mascota' });
  }
};

const editarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteId, nombre, especie, raza, fechaNacimiento, sexo, peso } = req.body;

    const actualizada = await mascotaModel.actualizarMascota(id, {
      clienteId,
      nombre,
      especie,
      raza,
      fechaNacimiento,
      sexo,
      peso
    });

    if (actualizada) {
      res.status(200).json({ mensaje: 'Mascota actualizada con éxito' });
    } else {
      res.status(404).json({ error: 'Mascota no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar la mascota' });
  }
};

const desactivarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const desactivada = await mascotaModel.cambiarEstadoMascota(id, 0);

    if (desactivada) {
      res.status(200).json({ mensaje: 'Mascota desactivada con éxito' });
    } else {
      res.status(404).json({ error: 'Mascota no encontrada' });
    }
  } catch (error) {
    console.error('Error al desactivar mascota:', error);
    res.status(500).json({ error: 'Hubo un error al desactivar la mascota' });
  }
};

module.exports = {
  listarMascotas,
  obtenerMascota,
  listarMascotasPorCliente,
  buscarMascotas,
  crearMascota,
  editarMascota,
  desactivarMascota
};