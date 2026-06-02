const express = require('express');
const router = express.Router();
const { listarProductos, registrarProducto, editarProducto, desactivarProducto } = require('../controllers/productoController');
const { verificarToken, esAdmin, esAdminORecepcionista } = require('../middlewares/authMiddleware');

// Todos ven el inventario
router.get('/', verificarToken, listarProductos);

// Admin y Recepcionista pueden crear y editar (RF-27)
router.post('/', verificarToken, esAdminORecepcionista, registrarProducto);
router.put('/:id', verificarToken, esAdminORecepcionista, editarProducto);

// SOLO el Admin puede desactivar
router.patch('/:id/desactivar', verificarToken, esAdmin, desactivarProducto);

module.exports = router;