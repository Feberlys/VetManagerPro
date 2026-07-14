require('dotenv').config(); // <-- TIENE QUE SER LO PRIMERO
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getConnection } = require('./src/config/db');

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// Inicializar la conexión a la base de datos
getConnection();

// ==========================================
// 2. RUTAS DE LA API
// ==========================================

// Autenticación
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Módulo M1 - Usuarios (Feberlys)
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

// Módulo M2 - Clientes y Mascotas (Miguel)
const clienteRoutes = require('./src/routes/clienteRoutes');
app.use('/api/clientes', clienteRoutes);

const mascotaRoutes = require('./src/routes/mascotaRoutes');
app.use('/api/mascotas', mascotaRoutes);

// Módulo M3 - Citas
const citaRoutes = require('./src/routes/citaRoutes');
app.use('/api/citas', citaRoutes);

// Módulo M4 - Historial Médico y Vacunas (Eduardo)
const historialRoutes = require('./src/routes/historialRoutes');
app.use('/api/historial', historialRoutes);

const vacunaRoutes = require('./src/routes/vacunaRoutes'); // Asegúrate de que el archivo se llame así
app.use('/api/vacunas', vacunaRoutes);

// Módulo M5 - Notificaciones
const notificacionRoutes = require('./src/routes/notificacionRoutes');
app.use('/api/notificaciones', notificacionRoutes);

// Módulo M7 - Inventario (Feberlys)
const productoRoutes = require('./src/routes/productoRoutes');
app.use('/api/productos', productoRoutes);

// Módulo Guardería
const guarderiaRoutes = require('./src/routes/guarderiaRoutes');
app.use('/api/guarderia', guarderiaRoutes);

// ==========================================
// 3. PROCESOS EN SEGUNDO PLANO (JOBS)
// ==========================================
// Activar proceso automático de notificaciones - Módulo M5
const { iniciarNotificacionesAutomaticas } = require('./src/jobs/notificacionJob');
iniciarNotificacionesAutomaticas();

// ==========================================
// 4. RUTA BASE Y ARRANQUE DEL SERVIDOR
// ==========================================
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de VetManager Pro funcionando 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});