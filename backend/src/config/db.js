require('dotenv').config();
const sql = require('mssql'); // Usamos el driver estándar oficial para la web

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Obligatorio para la seguridad de Azure
        trustServerCertificate: true 
    }
};

let pool = null;

const getConnection = async () => {
    // Si ya hay conexión, la reutiliza (buena práctica para la nube)
    if (pool && pool.connected) {
        return pool;
    }

    try {
        console.log('☁️ Conectando a la base de datos en Azure...');
        pool = await sql.connect(dbConfig);
        console.log('✅ Base de datos en la nube conectada con éxito 🚀');
        return pool;
    } catch (error) {
        console.error('❌ Error conectando a Azure:', error);
        throw error;
    }
};

module.exports = { sql, getConnection };