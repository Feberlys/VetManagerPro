const express = require('express');
const router = express.Router();

const {
  listarMascotas,
  obtenerMascota,
  listarMascotasPorCliente,
  buscarMascotas,
  crearMascota,
  editarMascota,
  cambiarEstadoMascota
} = require('../controllers/mascotaController');

const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, listarMascotas);
router.get('/buscar', verificarToken, buscarMascotas);
router.get('/cliente/:clienteId', verificarToken, listarMascotasPorCliente);
router.get('/:id', verificarToken, obtenerMascota);
router.post('/', verificarToken, crearMascota);
router.put('/:id', verificarToken, editarMascota);
router.patch('/:id/estado', verificarToken, cambiarEstadoMascota);

module.exports = router;