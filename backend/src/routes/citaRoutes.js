const express = require('express');
const router = express.Router();

const {
  listarCitas,
  obtenerCita,
  listarCitasPorFecha,
  listarCitasPorMascota,
  listarEstadosCita,
  crearCita,
  cambiarEstado,
  cancelarCita,
  reprogramarCita
} = require('../controllers/citaController');

const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, listarCitas);
router.get('/estados', verificarToken, listarEstadosCita);
router.get('/fecha/:fecha', verificarToken, listarCitasPorFecha);
router.get('/mascota/:mascotaId', verificarToken, listarCitasPorMascota);
router.get('/:id', verificarToken, obtenerCita);
router.post('/', verificarToken, crearCita);
router.patch('/:id/estado', verificarToken, cambiarEstado);
router.patch('/:id/cancelar', verificarToken, cancelarCita);
router.patch('/:id/reprogramar', verificarToken, reprogramarCita);

module.exports = router;