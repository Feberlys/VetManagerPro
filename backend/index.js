const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getConnection } = require('./src/config/db');

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (React)
app.use(express.json()); // Permite leer datos en formato JSON

// Inicializar la conexión a la base de datos
getConnection();

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de VetManager Pro funcionando 🚀' });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});