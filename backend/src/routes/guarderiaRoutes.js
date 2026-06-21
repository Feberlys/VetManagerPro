const express = require('express');
const router = express.Router();

const guarderiaController = require('../controllers/guarderiaController');
// Quitamos esAdminORecepcionista porque ahora todo el personal tiene acceso operativo
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

// Ver espacios: Todo el personal autenticado
router.get(
  '/espacios',
  verificarToken,
  guarderiaController.getEspaciosHotel
);

// Ver espacios disponibles: Todo el personal autenticado
router.get(
  '/espacios/disponibles',
  verificarToken,
  guarderiaController.getEspaciosDisponibles
);

// Crear espacio: solo Admin (Protegido)
router.post(
  '/espacios',
  verificarToken,
  esAdmin,
  guarderiaController.crearEspacioHotel
);

// Actualizar espacio: solo Admin (Protegido)
router.put(
  '/espacios/:id',
  verificarToken,
  esAdmin,
  guarderiaController.actualizarEspacioHotel
);

// Check-in: Todo el personal autenticado
router.post(
  '/checkin',
  verificarToken,
  guarderiaController.hacerCheckIn
);

// Check-out: Todo el personal autenticado
router.put(
  '/checkout/:id',
  verificarToken,
  guarderiaController.hacerCheckOut
);

// Ocupación: Todo el personal autenticado
router.get(
  '/ocupacion',
  verificarToken,
  guarderiaController.getOcupacionHotel
);

module.exports = router;