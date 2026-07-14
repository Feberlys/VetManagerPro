const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');

// Definir las rutas
router.post('/registro', registrar);
router.post('/login', login);

// Añade esto en authRoutes.js
router.get('/crear-admin-nuevo', async (req, res) => {
    const { registrar } = require('../controllers/authController');
    // Simulamos un req.body para crear el admin nuevo
    req.body = {
        nombreUsuario: 'admin_nuevo',
        password: 'vetmanager123',
        nombreCompleto: 'Admin Nuevo',
        correo: 'admin_nuevo@vetmanager.com',
        rolId: 1
    };
    // Reutilizamos tu función de registro existente
    await registrar(req, res);
});

module.exports = router;