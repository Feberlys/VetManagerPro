const express = require('express');
const router = express.Router();

const {
  listarClientes,
  obtenerCliente,
  buscarClientes,
  crearCliente,
  editarCliente,
} = require('../controllers/clienteController');

const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, listarClientes);
router.get('/buscar', verificarToken, buscarClientes);
router.get('/:id', verificarToken, obtenerCliente);
router.post('/', verificarToken, crearCliente);
router.put('/:id', verificarToken, editarCliente);

module.exports = router;