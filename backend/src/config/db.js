const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const drivers = [
    'ODBC Driver 17 for SQL Server',
    'ODBC Driver 18 for SQL Server',
    'SQL Server Native Client 11.0',
    'ODBC Driver 13 for SQL Server',
    'SQL Server'
];

let pool = null;

const getConnection = async () => {
    if (pool && pool.connected) {
        return pool;
    }

    console.log('🔄 Buscando el driver correcto para LocalDB...');

    for (const driver of drivers) {
        try {
            const connectionString = `Driver={${driver}};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;TrustServerCertificate=yes;`;

            pool = await sql.connect({ connectionString });

            console.log(`✅ Base de datos conectada con éxito usando el driver: [${driver}] 🚀`);
            return pool;

        } catch (error) {
            if (driver === drivers[drivers.length - 1]) {
                console.error('❌ Ningún driver funcionó. Revisa SQL Server, la BD y el .env.');
                throw error;
            }
        }
    }
};

module.exports = { sql, getConnection };