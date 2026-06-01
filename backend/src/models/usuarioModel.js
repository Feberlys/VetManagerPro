const { sql, getConnection } = require('../config/db');

const buscarUsuarioPorCorreo = async (correo) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query(`
            SELECT UsuarioId, NombreUsuario, PasswordHash, NombreCompleto, Correo, RolId, Estado 
            FROM Usuarios 
            WHERE Correo = @correo AND Estado = 1
        `);
    return result.recordset[0]; // Retorna el usuario o undefined
};

const crearUsuario = async (usuario) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('nombreUsuario', sql.NVarChar, usuario.nombreUsuario)
        .input('passwordHash', sql.NVarChar, usuario.passwordHash)
        .input('nombreCompleto', sql.NVarChar, usuario.nombreCompleto)
        .input('correo', sql.NVarChar, usuario.correo)
        .input('rolId', sql.Int, usuario.rolId)
        .query(`
            INSERT INTO Usuarios (NombreUsuario, PasswordHash, NombreCompleto, Correo, RolId)
            OUTPUT INSERTED.UsuarioId
            VALUES (@nombreUsuario, @passwordHash, @nombreCompleto, @correo, @rolId)
        `);
    return result.recordset[0];
};

module.exports = { buscarUsuarioPorCorreo, crearUsuario };