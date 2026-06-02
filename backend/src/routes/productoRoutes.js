const express = require('express');
const router = express.Router();
const { listarProductos, registrarProducto, editarProducto, desactivarProducto, activarProducto } = require('../controllers/productoController');
const { verificarToken, esAdmin, esAdminORecepcionista } = require('../middlewares/authMiddleware');

// Todos ven el inventario
router.get('/', verificarToken, listarProductos);

// Admin y Recepcionista pueden crear y editar (RF-27)
router.post('/', verificarToken, esAdminORecepcionista, registrarProducto);
router.put('/:id', verificarToken, esAdminORecepcionista, editarProducto);

// SOLO el Admin puede cambiar estados
router.patch('/:id/desactivar', verificarToken, esAdmin, desactivarProducto);
router.patch('/:id/activar', verificarToken, esAdmin, activarProducto);

module.exports = router;