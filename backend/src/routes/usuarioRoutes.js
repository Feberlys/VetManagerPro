const express = require('express');
const router = express.Router();
const { listarUsuarios, editarUsuario, desactivarUsuario, crearUsuarioAdmin,listarVeterinarios } = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');
const { activarUsuario } = require('../controllers/usuarioController');

router.get('/', verificarToken, esAdmin, listarUsuarios);
router.post('/', verificarToken, esAdmin, crearUsuarioAdmin);
router.put('/:id', verificarToken, esAdmin, editarUsuario);
router.patch('/:id/desactivar', verificarToken, esAdmin, desactivarUsuario);
router.patch('/:id/activar', verificarToken, esAdmin, activarUsuario);
router.get('/veterinarios', verificarToken, listarVeterinarios);
module.exports = router;