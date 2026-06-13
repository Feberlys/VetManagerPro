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

const obtenerUsuarios = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT UsuarioId, NombreUsuario, NombreCompleto, Correo, RolId, Estado 
            FROM Usuarios
        `);
    // Nota: Nunca seleccionamos el PasswordHash por seguridad
    return result.recordset;
};

const actualizarUsuario = async (id, datos) => {
    const pool = await getConnection();

    let query = `
        UPDATE Usuarios 
        SET 
            NombreUsuario = @nombreUsuario,
            NombreCompleto = @nombreCompleto,
            Correo = @correo,
            RolId = @rolId
    `;

    if (datos.passwordHash) {
        query += `,
            PasswordHash = @passwordHash
        `;
    }

    query += `
        WHERE UsuarioId = @id
    `;

    const request = pool.request()
        .input('id', sql.Int, id)
        .input('nombreUsuario', sql.NVarChar, datos.nombreUsuario)
        .input('nombreCompleto', sql.NVarChar, datos.nombreCompleto)
        .input('correo', sql.NVarChar, datos.correo)
        .input('rolId', sql.Int, datos.rolId);

    if (datos.passwordHash) {
        request.input('passwordHash', sql.NVarChar, datos.passwordHash);
    }

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
};

const cambiarEstadoUsuario = async (id, estado) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('estado', sql.Bit, estado)
        .query(`
            UPDATE Usuarios 
            SET Estado = @estado
            WHERE UsuarioId = @id
        `);
    return result.rowsAffected[0] > 0;
};

const obtenerVeterinarios = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT UsuarioId, NombreUsuario, NombreCompleto, Correo, RolId, Estado
            FROM Usuarios
            WHERE RolId = 2 AND Estado = 1
        `);

    return result.recordset;
};

// No olvides exportar las nuevas funciones
module.exports = { 
    buscarUsuarioPorCorreo, 
    crearUsuario, 
    obtenerUsuarios, 
    actualizarUsuario, 
    cambiarEstadoUsuario, 
    obtenerVeterinarios
};