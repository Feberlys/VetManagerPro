const { getConnection, sql } = require('../../config/db'); // Ajusta la ruta si tu db.js está en otro lado

const obtenerProductos = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT ProductoId, Nombre, Descripcion, Precio, Stock, Estado 
            FROM Productos
        `);
    return result.recordset;
};

const crearProducto = async (datos) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('nombre', sql.NVarChar, datos.nombre)
        .input('descripcion', sql.NVarChar, datos.descripcion || '')
        .input('precio', sql.Decimal(10, 2), datos.precio)
        .input('stock', sql.Int, datos.stock)
        .query(`
            INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, Estado)
            VALUES (@nombre, @descripcion, @precio, @stock, 1)
        `);
    return result.rowsAffected[0] > 0;
};

const actualizarProducto = async (id, datos) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, datos.nombre)
        .input('descripcion', sql.NVarChar, datos.descripcion || '')
        .input('precio', sql.Decimal(10, 2), datos.precio)
        .input('stock', sql.Int, datos.stock)
        .query(`
            UPDATE Productos 
            SET Nombre = @nombre, Descripcion = @descripcion, Precio = @precio, Stock = @stock
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