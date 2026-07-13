const { getConnection, sql } = require('../config/db');

const obtenerProductos = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            -- AQUI ESTABA EL ERROR: Faltaba pedir Categoria y FechaVencimiento
            SELECT ProductoId, Nombre, Descripcion, CantidadActual, NivelMinimo, Estado, FechaRegistro, Categoria, FechaVencimiento 
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
        .input('categoria', sql.NVarChar, datos.categoria || 'General')
        .input('fechaVencimiento', sql.Date, datos.fechaVencimiento || null)
        .query(`
            -- AQUI ESTABA EL ERROR: No se estaban insertando los nuevos campos
            INSERT INTO Productos (Nombre, Descripcion, CantidadActual, NivelMinimo, Categoria, FechaVencimiento, Estado)
            VALUES (@nombre, @descripcion, @cantidadActual, @nivelMinimo, @categoria, @fechaVencimiento, 1)
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
        .input('categoria', sql.NVarChar, datos.categoria || 'General')
        .input('fechaVencimiento', sql.Date, datos.fechaVencimiento || null)
        .query(`
            -- AQUI ESTABA EL ERROR: No se estaban actualizando los nuevos campos
            UPDATE Productos 
            SET Nombre = @nombre, 
                Descripcion = @descripcion, 
                CantidadActual = @cantidadActual, 
                NivelMinimo = @nivelMinimo,
                Categoria = @categoria,
                FechaVencimiento = @fechaVencimiento
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