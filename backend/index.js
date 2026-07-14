require('dotenv').config(); // <-- TIENE QUE SER LO PRIMERO
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getConnection } = require('./src/config/db');

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================
app.use(cors({
  origin: 'https://vetmanagerpro-2.onrender.com', // Tu URL de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

getConnection();

// Autenticación
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);


// Módulo M1 - Usuarios 
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

// Módulo M2 - Clientes y Mascotas 
const clienteRoutes = require('./src/routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

const mascotaRoutes = require('./src/routes/mascotaRoutes');
app.use('/api/mascotas', mascotaRoutes);

// Módulo M3 - Citas
const citaRoutes = require('./src/routes/citaRoutes');
app.use('/api/citas', citaRoutes);

// Módulo M4 - Historial Médico y Vacunas
const historialRoutes = require('./src/routes/historialRoutes');
app.use('/api/historial', historialRoutes);

const vacunaRoutes = require('./src/routes/vacunaRoutes'); // Asegúrate de que el archivo se llame así
app.use('/api/vacunas', vacunaRoutes);

// Módulo M5 - Notificaciones
const notificacionRoutes = require('./src/routes/notificacionRoutes');
app.use('/api/notificaciones', notificacionRoutes);

// Módulo M7 - Inventario
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', productoRoutes);

// Módulo Guardería
const guarderiaRoutes = require('./src/routes/guarderiaRoutes');
app.use('/api/guarderia', guarderiaRoutes);


const { iniciarNotificacionesAutomaticas } = require('./src/jobs/notificacionJob');
iniciarNotificacionesAutomaticas();


app.get('/', (req, res) => {
    res.json({ mensaje: 'API de VetManager Pro funcionando 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});