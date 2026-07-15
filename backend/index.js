require('dotenv').config(); // <-- TIENE QUE SER LO PRIMERO
const express = require('express');
const cors = require('cors');
const { getConnection } = require('./src/config/db');

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================

// CORS mejorado: Detectar origen del frontend dinámicamente
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://vetmanagerpro.onrender.com',  // Frontend URL
      'https://vetmanagerpro-2.onrender.com', // Por si acaso
      'http://localhost:5173',                 // Desarrollo local (Vite)
      'http://localhost:3000',                 // Desarrollo local alternativo
    ];
    
    // Si no hay origin (requests desde server-side), permitir
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS rechazó origen:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Si usas cookies/auth
  maxAge: 86400 // 24 horas
};


app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware para debugging
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

getConnection();

// ==========================================
// 2. RUTAS (compatibles con /api y sin prefijo)
// ==========================================
const mountRoute = (path, router) => {
  app.use(path, router);
  app.use(`/api${path}`, router);
};

// Autenticación
const authRoutes = require('./src/routes/authRoutes');
mountRoute('/auth', authRoutes);

// Módulo M1 - Usuarios 
const usuarioRoutes = require('./src/routes/usuarioRoutes');
mountRoute('/usuarios', usuarioRoutes);

// Módulo M2 - Clientes y Mascotas 
const clienteRoutes = require('./src/routes/clienteRoutes');
mountRoute('/clientes', clienteRoutes);

const mascotaRoutes = require('./src/routes/mascotaRoutes');
mountRoute('/mascotas', mascotaRoutes);

// Módulo M3 - Citas
const citaRoutes = require('./src/routes/citaRoutes');
mountRoute('/citas', citaRoutes);

// Módulo M4 - Historial Médico y Vacunas
const historialRoutes = require('./src/routes/historialRoutes');
mountRoute('/historial', historialRoutes);

const vacunaRoutes = require('./src/routes/vacunaRoutes');
mountRoute('/vacunas', vacunaRoutes);

// Módulo M5 - Notificaciones
const notificacionRoutes = require('./src/routes/notificacionRoutes');
mountRoute('/notificaciones', notificacionRoutes);

// Módulo M7 - Inventario
const productoRoutes = require('./src/routes/productoRoutes');
mountRoute('/productos', productoRoutes);

// Módulo Guardería
const guarderiaRoutes = require('./src/routes/guarderiaRoutes');
mountRoute('/guarderia', guarderiaRoutes);

// ==========================================
// 3. PROCESOS EN SEGUNDO PLANO (JOBS)
// ==========================================
const { iniciarNotificacionesAutomaticas } = require('./src/jobs/notificacionJob');
iniciarNotificacionesAutomaticas();


app.get('/', (req, res) => {
    res.json({ 
      mensaje: 'API de VetManager Pro funcionando 🚀',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
});

// Manejo de ruta no encontrada (404)
app.use((req, res) => {
  console.error(`❌ 404 - Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('⚠️ Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 CORS habilitado para: https://vetmanagerpro.onrender.com`);
});
