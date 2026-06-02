const express = require('express');
const router = express.Router();
const { listarProductos, registrarProducto, editarProducto, desactivarProducto } = require('../controllers/productoController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

// Todos pueden ver el inventario (solo se pide estar logueado)
router.get('/', verificarToken, listarProductos);

// Solo el Admin puede modificar el inventario
router.post('/', verificarToken, esAdmin, registrarProducto);
router.put('/:id', verificarToken, esAdmin, editarProducto);
router.patch('/:id/desactivar', verificarToken, esAdmin, desactivarProducto);

module.exports = router;