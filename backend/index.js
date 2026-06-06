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

// Rutas de M4 - Historial Médico (Eduardo)
const historialRoutes = require('./src/routes/historialRoutes');
app.use('/api/historial', historialRoutes);

const vacunaRoutes = require('./src/routes/vacunaRoutes');
app.use('/api/vacunas', vacunaRoutes);
// Ruta de clientes
const clienteRoutes = require('./src/routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

// Ruta de mascotas
const mascotaRoutes = require('./src/routes/mascotaRoutes');
app.use('/api/mascotas', mascotaRoutes);

// Ruta de citas
const citaRoutes = require('./src/routes/citaRoutes');
app.use('/api/citas', citaRoutes);

// Ruta de guarderia
const guarderiaRoutes = require('./src/routes/guarderiaRoutes');
app.use('/api/guarderia', guarderiaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de VetManager Pro funcionando 🚀' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});