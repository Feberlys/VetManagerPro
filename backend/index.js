const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getConnection } = require('./src/config/db');

const app = express();

// 1. PRIMERO los Middlewares (Los traductores)
app.use(cors()); 
app.use(express.json()); // <-- ¡ESTO ES VITAL QUE ESTÉ AQUÍ!

// Inicializar la conexión a la base de datos
getConnection();

// 2. DESPUÉS las Rutas (Las direcciones)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Agregar la nueva ruta de usuarios
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

//Ruta de productos
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', productoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de VetManager Pro funcionando 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});