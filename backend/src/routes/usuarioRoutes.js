const express = require('express');
const router = express.Router();
const { listarUsuarios, editarUsuario, desactivarUsuario, crearUsuarioAdmin } = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, esAdmin, listarUsuarios);
router.post('/', verificarToken, esAdmin, crearUsuarioAdmin);
router.put('/:id', verificarToken, esAdmin, editarUsuario);
router.patch('/:id/desactivar', verificarToken, esAdmin, desactivarUsuario);

module.exports = router;