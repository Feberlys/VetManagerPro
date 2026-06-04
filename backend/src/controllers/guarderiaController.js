const guarderiaModel = require('../models/guarderiaModel');
const emailService = require('../services/emailService');

const getEspaciosHotel = async (req, res) => {
  try {
    const espacios = await guarderiaModel.getEspaciosHotel();

    res.json({
      success: true,
      data: espacios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los espacios del hotel.',
      error: error.message
    });
  }
};

const getEspaciosDisponibles = async (req, res) => {
  try {
    const espacios = await guarderiaModel.getEspaciosDisponibles();

    res.json({
      success: true,
      data: espacios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los espacios disponibles.',
      error: error.message
    });
  }
};

const crearEspacioHotel = async (req, res) => {
  try {
    const { numeroEspacio, tipo, precioPorNoche } = req.body;

    if (!numeroEspacio || !tipo || precioPorNoche === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe completar número de espacio, tipo y precio por noche.'
      });
    }

    const tiposValidos = ['Pequeño', 'Mediano', 'Grande'];

    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser Pequeño, Mediano o Grande.'
      });
    }

    if (Number(precioPorNoche) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio por noche debe ser mayor que cero.'
      });
    }

    const nuevoEspacio = await guarderiaModel.crearEspacioHotel(
      numeroEspacio,
      tipo,
      Number(precioPorNoche)
    );

    res.status(201).json({
      success: true,
      message: 'Espacio de hotel creado correctamente.',
      data: nuevoEspacio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el espacio de hotel.',
      error: error.message
    });
  }
};

const actualizarEspacioHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroEspacio, tipo, precioPorNoche, estado } = req.body;

    if (!numeroEspacio || !tipo || precioPorNoche === undefined || !estado) {
      return res.status(400).json({
        success: false,
        message: 'Debe completar todos los campos.'
      });
    }

    const tiposValidos = ['Pequeño', 'Mediano', 'Grande'];
    const estadosValidos = ['Disponible', 'Ocupado', 'Mantenimiento'];

    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser Pequeño, Mediano o Grande.'
      });
    }

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser Disponible, Ocupado o Mantenimiento.'
      });
    }

    const espacioActualizado = await guarderiaModel.actualizarEspacioHotel(
      Number(id),
      numeroEspacio,
      tipo,
      Number(precioPorNoche),
      estado
    );

    if (!espacioActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Espacio no encontrado.'
      });
    }

    res.json({
      success: true,
      message: 'Espacio actualizado correctamente.',
      data: espacioActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el espacio.',
      error: error.message
    });
  }
};

const hacerCheckIn = async (req, res) => {
  try {
    const {
      mascotaId,
      espacioId,
      fechaEntrada,
      fechaSalidaEstimada,
      notasEspeciales
    } = req.body;

    if (!mascotaId || !espacioId || !fechaEntrada || !fechaSalidaEstimada) {
      return res.status(400).json({
        success: false,
        message: 'Debe completar mascota, espacio, fecha de entrada y fecha estimada de salida.'
      });
    }

    const entrada = new Date(fechaEntrada);
    const salidaEstimada = new Date(fechaSalidaEstimada);

    if (salidaEstimada <= entrada) {
      return res.status(400).json({
        success: false,
        message: 'La fecha estimada de salida debe ser mayor que la fecha de entrada.'
      });
    }

    const hospedaje = await guarderiaModel.hacerCheckIn(
      Number(mascotaId),
      Number(espacioId),
      entrada,
      salidaEstimada,
      notasEspeciales
    );

    res.status(201).json({
      success: true,
      message: 'Check-in realizado correctamente.',
      data: hospedaje
    });
  } catch (error) {
     console.error('ERROR CHECK-IN:', error);
    console.error(error.stack);

    res.status(500).json({
      success: false,
      message: 'Error al realizar el check-in.',
      error: error.message
    });
  }
};

const getOcupacionHotel = async (req, res) => {
  try {
    const ocupacion = await guarderiaModel.getOcupacionHotel();

    res.json({
      success: true,
      data: ocupacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la ocupación del hotel.',
      error: error.message
    });
  }
};

const hacerCheckOut = async (req, res) => {
  try {
    const { id } = req.params;

    const hospedaje = await guarderiaModel.getHospedajeById(Number(id));

    if (!hospedaje) {
      return res.status(404).json({
        success: false,
        message: 'Hospedaje no encontrado.'
      });
    }

    if (hospedaje.Estado !== 'Activo') {
      return res.status(400).json({
        success: false,
        message: 'Este hospedaje ya no está activo.'
      });
    }

    const fechaEntrada = new Date(hospedaje.FechaEntrada);
    const fechaSalidaReal = new Date();

    const diferenciaMs = fechaSalidaReal - fechaEntrada;
    const noches = Math.max(1, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)));

    const totalCobrar = noches * Number(hospedaje.PrecioPorNoche);

    const checkout = await guarderiaModel.hacerCheckOut(
      Number(id),
      fechaSalidaReal,
      totalCobrar
    );

    try {
    await emailService.enviarCorreoRecogida(
      hospedaje.Correo,
      hospedaje.NombreCliente,
      hospedaje.NombreMascota,
      totalCobrar
    );

    console.log(`📧 Correo enviado a ${hospedaje.Correo}`);
  } catch (emailError) {
    console.error('Error enviando correo:', emailError.message);
  }

    res.json({
      success: true,
      message: 'Check-out realizado correctamente.',
      data: {
        ...checkout,
        noches,
        totalCobrar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al realizar el check-out.',
      error: error.message
    });
  }
};

module.exports = {
  getEspaciosHotel,
  getEspaciosDisponibles,
  crearEspacioHotel,
  actualizarEspacioHotel,
  hacerCheckIn,
  getOcupacionHotel,
  hacerCheckOut
};