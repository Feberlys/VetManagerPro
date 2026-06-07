const clienteModel = require('../models/clienteModel');

const listarClientes = async (req, res) => {
  try {
    const clientes = await clienteModel.obtenerClientes();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({ error: 'Hubo un error al obtener los clientes' });
  }
};

const obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await clienteModel.obtenerClientePorId(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Hubo un error al obtener el cliente' });
  }
};

const buscarClientes = async (req, res) => {
  try {
    const { nombre } = req.query;
    const clientes = await clienteModel.buscarClientes(nombre || '');
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Hubo un error al buscar clientes' });
  }
};

const crearCliente = async (req, res) => {
  try {
    const { nombreCompleto, telefono, correo, direccion } = req.body;

    if (!nombreCompleto || !telefono) {
      return res.status(400).json({ error: 'Nombre completo y teléfono son obligatorios' });
    }

    const creado = await clienteModel.crearCliente({ nombreCompleto, telefono, correo, direccion });
    res.status(201).json({ mensaje: 'Cliente creado exitosamente', clienteId: creado.ClienteId });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: error.message || 'Hubo un error al crear el cliente' });
  }
};

const editarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, telefono, correo, direccion } = req.body;

    const actualizado = await clienteModel.actualizarCliente(id, {
      nombreCompleto,
      telefono,
      correo,
      direccion
    });

    if (actualizado) {
      res.status(200).json({ mensaje: 'Cliente actualizado con éxito' });
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el cliente' });
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  buscarClientes,
  crearCliente,
  editarCliente,
};