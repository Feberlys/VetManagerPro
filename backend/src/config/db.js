const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

// Lista de los drivers más comunes en Windows (de más nuevo a más viejo)
const drivers = [
    'ODBC Driver 17 for SQL Server',
    'SQL Server Native Client 11.0',
    'ODBC Driver 18 for SQL Server',
    'ODBC Driver 13 for SQL Server',
    'SQL Server' // El driver base universal de Windows
];

const getConnection = async () => {
    console.log('🔄 Buscando el driver correcto para LocalDB...');
    
    for (const driver of drivers) {
        try {
            // Construimos la cadena cruda exactamente como la exige el sistema operativo
            const connectionString = `Driver={${driver}};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;TrustServerCertificate=yes;`;
            
            // Intentamos conectar
            const pool = await sql.connect({ connectionString });
            
            console.log(`✅ Base de datos conectada con éxito usando el driver: [${driver}] 🚀`);
            return pool; // Si funciona, rompemos el bucle y devolvemos la conexión
            
        } catch (error) {
            // Si es el último driver de la lista y también falla, entonces sí lanzamos el error
            if (driver === drivers[drivers.length - 1]) {
                console.error('❌ Colapso total: Ningún driver funcionó. Revisa que VetManagerPro esté creada en SSMS.');
                throw error;
            }
        }
    }
};

module.exports = { sql, getConnection };