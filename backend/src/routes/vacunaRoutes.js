const express = require('express');
const router = express.Router();
const { registrarVacuna, obtenerVacunasPorMascota } = require('../controllers/vacunaController');
const { verificarToken, esVeterinario } = require('../middlewares/authMiddleware');

// RF-16: Veterinario registra vacuna (con descuento opcional de inventario)
router.post('/', verificarToken, esVeterinario, registrarVacuna);

// Ver vacunas de una mascota (todos los roles autenticados)
router.get('/mascota/:mascotaId', verificarToken, obtenerVacunasPorMascota);

module.exports = router;
