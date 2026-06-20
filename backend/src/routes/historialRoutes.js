const express = require('express');
const router = express.Router();
const { crearConsulta, obtenerHistorialPorMascota, obtenerConsultaPorId } = require('../controllers/historialController');
const { verificarToken, esVeterinario } = require('../middlewares/authMiddleware');

// RF-14: Veterinario registra consulta con productos (liga historial-inventario)
router.post('/', verificarToken, esVeterinario, crearConsulta);

// RF-15 + RF-17: Ver historial completo de una mascota (todos los roles autenticados)
router.get('/mascota/:mascotaId', verificarToken, obtenerHistorialPorMascota);

// Detalle de una consulta específica con productos usados
router.get('/:historialId', verificarToken, obtenerConsultaPorId);

module.exports = router;
