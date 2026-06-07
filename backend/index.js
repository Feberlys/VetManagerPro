const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getConnection } = require('./src/config/db');

const app = express();

// 1. PRIMERO los Middlewares
app.use(cors());
app.use(express.json());

// Inicializar la conexión a la base de datos
getConnection();

// 2. DESPUÉS las Rutas
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Ruta de usuarios
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

// Ruta de productos
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', productoRoutes);

// Ruta de notificaciones por email - Módulo M5
const notificacionRoutes = require('./src/routes/notificacionRoutes');
app.use('/api/notificaciones', notificacionRoutes);

// Activar proceso automático de notificaciones - Módulo M5
const { iniciarNotificacionesAutomaticas } = require('./src/jobs/notificacionJob');
iniciarNotificacionesAutomaticas();

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de VetManager Pro funcionando 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});