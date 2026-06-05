const { getConnection, sql } = require('../config/db');

// RF-14: Crear consulta médica con productos (transacción completa)
const crearConsulta = async (mascotaId, citaId, veterinarioId, diagnostico, tratamiento, notasAdicionales, productosUsados = []) => {
    const pool = await getConnection();
    const request = pool.request();

    request.input('MascotaId', sql.Int, mascotaId);
    request.input('CitaId', sql.Int, citaId || null);
    request.input('VeterinarioId', sql.Int, veterinarioId);
    request.input('Diagnostico', sql.NVarChar, diagnostico);
    request.input('Tratamiento', sql.NVarChar, tratamiento || null);
    request.input('NotasAdicionales', sql.NVarChar, notasAdicionales || null);

    // Construir SQL dinámico para los productos usados
    let productosSQL = '';
    productosUsados.forEach((prod, i) => {
        request.input(`ProdId${i}`, sql.Int, prod.productoId);
        request.input(`ProdCant${i}`, sql.Int, prod.cantidad);
        productosSQL += `
            INSERT INTO HistorialProductos (HistorialId, ProductoId, Cantidad)
            VALUES (@HistorialId, @ProdId${i}, @ProdCant${i});

            INSERT INTO MovimientosInventario (ProductoId, UsuarioId, TipoMovimiento, Cantidad, Observacion)
            VALUES (@ProdId${i}, @VeterinarioId, 'Salida', @ProdCant${i}, CONCAT('Consulta #', @HistorialId));

            UPDATE Productos SET CantidadActual = CantidadActual - @ProdCant${i}
            WHERE ProductoId = @ProdId${i};
        `;
    });

    const query = `
        DECLARE @HistorialId INT;

        BEGIN TRANSACTION;
        BEGIN TRY
            INSERT INTO HistorialMedico (MascotaId, CitaId, VeterinarioId, Diagnostico, Tratamiento, NotasAdicionales)
            VALUES (@MascotaId, @CitaId, @VeterinarioId, @Diagnostico, @Tratamiento, @NotasAdicionales);

            SET @HistorialId = SCOPE_IDENTITY();

            ${productosSQL}

            COMMIT TRANSACTION;
            SELECT @HistorialId AS HistorialId;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    `;

    const result = await request.query(query);
    return result.recordset[0].HistorialId;
};

// RF-15 + RF-17: Obtener historial completo de una mascota
const obtenerHistorialPorMascota = async (mascotaId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('MascotaId', sql.Int, mascotaId)
        .query(`
            SELECT 
                h.HistorialId,
                h.MascotaId,
                h.CitaId,
                h.VeterinarioId,
                u.NombreCompleto AS NombreVeterinario,
                h.Diagnostico,
                h.Tratamiento,
                h.NotasAdicionales,
                h.FechaConsulta
            FROM HistorialMedico h
            INNER JOIN Usuarios u ON h.VeterinarioId = u.UsuarioId
            WHERE h.MascotaId = @MascotaId
            ORDER BY h.FechaConsulta DESC
        `);
    return result.recordset;
};

// Obtener detalle de una consulta con los productos usados
const obtenerConsultaPorId = async (historialId) => {
    const pool = await getConnection();

    const consulta = await pool.request()
        .input('HistorialId', sql.Int, historialId)
        .query(`
            SELECT 
                h.HistorialId,
                h.MascotaId,
                m.Nombre AS NombreMascota,
                h.CitaId,
                h.VeterinarioId,
                u.NombreCompleto AS NombreVeterinario,
                h.Diagnostico,
                h.Tratamiento,
                h.NotasAdicionales,
                h.FechaConsulta
            FROM HistorialMedico h
            INNER JOIN Usuarios u ON h.VeterinarioId = u.UsuarioId
            INNER JOIN Mascotas m ON h.MascotaId = m.MascotaId
            WHERE h.HistorialId = @HistorialId
        `);

    const productos = await pool.request()
        .input('HistorialId', sql.Int, historialId)
        .query(`
            SELECT 
                hp.HistorialProductoId,
                hp.ProductoId,
                p.Nombre AS NombreProducto,
                hp.Cantidad
            FROM HistorialProductos hp
            INNER JOIN Productos p ON hp.ProductoId = p.ProductoId
            WHERE hp.HistorialId = @HistorialId
        `);

    if (consulta.recordset.length === 0) return null;

    return {
        ...consulta.recordset[0],
        productosUsados: productos.recordset
    };
};

module.exports = {
    crearConsulta,
    obtenerHistorialPorMascota,
    obtenerConsultaPorId
};
