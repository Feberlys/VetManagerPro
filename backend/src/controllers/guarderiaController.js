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
      Number(mascotaId), Number(espacioId), entrada, salidaEstimada, notasEspeciales
    );

    // --- NUEVO: ENVÍO DE CORREO DE CHECK-IN ---
    try {
      // Validamos si el modelo nos devolvió el correo, de lo contrario no enviamos nada
      if (hospedaje && hospedaje.Correo) {
        await emailService.enviarCorreoCheckIn(
          hospedaje.Correo,
          hospedaje.NombreCliente,
          hospedaje.NombreMascota,
          entrada,
          salidaEstimada
        );
        console.log(`📧 Correo de check-in enviado a ${hospedaje.Correo}`);
      }
    } catch (emailError) {
      console.error('⚠️ Error al enviar el correo de check-in:', emailError.message);
    }
    // ------------------------------------------

    res.status(201).json({
      success: true,
      message: 'Check-in realizado correctamente.',
      data: hospedaje
    });

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

    // 1. Obtener los datos del hospedaje activo
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

    // 2. Cálculo exacto de noches (Mínimo 1 noche si es el mismo día)
    const diferenciaMs = fechaSalidaReal - fechaEntrada;
    const noches = Math.max(1, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)));
    const precioPorNoche = Number(hospedaje.PrecioPorNoche);
    const totalCobrar = noches * precioPorNoche;

    // 3. Registrar el check-out en la Base de Datos
    const checkout = await guarderiaModel.hacerCheckOut(
      Number(id),
      fechaSalidaReal,
      totalCobrar
    );

    // 4. Envío del correo unificado con desglose detallado
    try {
      // Le pasamos noches y precio por noche para que el template del email pueda armar un recibo limpio
      await emailService.enviarCorreoRecogida(
        hospedaje.Correo,
        hospedaje.NombreCliente,
        hospedaje.NombreMascota,
        totalCobrar,
        noches,
        precioPorNoche
      );

      console.log(`📧 Correo de check-out enviado a ${hospedaje.Correo}`);
    } catch (emailError) {
      // Capturamos el error sin tumbar la respuesta HTTP del cliente
      console.error('⚠️ Error al enviar el correo de check-out:', emailError.message);
    }

    // 5. Respuesta exitosa al Frontend
    res.json({
      success: true,
      message: 'Check-out realizado correctamente.',
      data: {
        ...checkout,
        noches,
        precioPorNoche,
        totalCobrar
      }
    });
  } catch (error) {
    console.error('ERROR CHECK-OUT:', error);
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