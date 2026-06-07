const express = require('express');
const router = express.Router();

const guarderiaController = require('../controllers/guarderiaController');
const { verificarToken, esAdmin, esAdminORecepcionista } = require('../middlewares/authMiddleware');

// Ver espacios: Admin y Recepcionista
router.get(
  '/espacios',
  verificarToken,
  esAdminORecepcionista,
  guarderiaController.getEspaciosHotel
);

// Ver espacios disponibles: Admin y Recepcionista
router.get(
  '/espacios/disponibles',
  verificarToken,
  esAdminORecepcionista,
  guarderiaController.getEspaciosDisponibles
);

// Crear espacio: solo Admin
router.post(
  '/espacios',
  verificarToken,
  esAdmin,
  guarderiaController.crearEspacioHotel
);

// Actualizar espacio: solo Admin
router.put(
  '/espacios/:id',
  verificarToken,
  esAdmin,
  guarderiaController.actualizarEspacioHotel
);

// Check-in: Admin y Recepcionista
router.post(
  '/checkin',
  verificarToken,
  esAdminORecepcionista,
  guarderiaController.hacerCheckIn
);

// Check-out: Admin y Recepcionista
router.put(
  '/checkout/:id',
  verificarToken,
  esAdminORecepcionista,
  guarderiaController.hacerCheckOut
);

// Ocupación: Admin y Recepcionista
router.get(
  '/ocupacion',
  verificarToken,
  esAdminORecepcionista,
  guarderiaController.getOcupacionHotel
);

module.exports = router;