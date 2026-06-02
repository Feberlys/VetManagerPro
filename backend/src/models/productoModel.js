const { getConnection, sql } = require('../config/db');

const obtenerProductos = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT ProductoId, Nombre, Descripcion, CantidadActual, NivelMinimo, Estado, FechaRegistro 
            FROM Productos
        `);
    return result.recordset;
};

const crearProducto = async (datos) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('nombre', sql.NVarChar, datos.nombre)
        .input('descripcion', sql.NVarChar, datos.descripcion || '')
        .input('cantidadActual', sql.Int, datos.cantidadActual)
        .input('nivelMinimo', sql.Int, datos.nivelMinimo)
        .query(`
            INSERT INTO Productos (Nombre, Descripcion, CantidadActual, NivelMinimo, Estado)
            VALUES (@nombre, @descripcion, @cantidadActual, @nivelMinimo, 1)
        `);
    return result.rowsAffected[0] > 0;
};

const actualizarProducto = async (id, datos) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, datos.nombre)
        .input('descripcion', sql.NVarChar, datos.descripcion || '')
        .input('cantidadActual', sql.Int, datos.cantidadActual)
        .input('nivelMinimo', sql.Int, datos.nivelMinimo)
        .query(`
            UPDATE Productos 
            SET Nombre = @nombre, Descripcion = @descripcion, CantidadActual = @cantidadActual, NivelMinimo = @nivelMinimo
            WHERE ProductoId = @id
        `);
    return result.rowsAffected[0] > 0;
};

const cambiarEstadoProducto = async (id, estado) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('estado', sql.Bit, estado)
        .query(`
            UPDATE Productos 
            SET Estado = @estado
            WHERE ProductoId = @id
        `);
    return result.rowsAffected[0] > 0;
};

module.exports = { 
    obtenerProductos, 
    crearProducto, 
    actualizarProducto, 
    cambiarEstadoProducto 
};