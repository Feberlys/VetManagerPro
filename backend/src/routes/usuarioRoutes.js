const express = require('express');
const router = express.Router();
const { listarUsuarios, editarUsuario, desactivarUsuario } = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

// Todas estas rutas pasan primero por verificarToken y luego por esAdmin
router.get('/', verificarToken, esAdmin, listarUsuarios);
router.put('/:id', verificarToken, esAdmin, editarUsuario);
router.patch('/:id/desactivar', verificarToken, esAdmin, desactivarUsuario);

module.exports = router;