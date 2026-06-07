const { getConnection, sql } = require('../config/db');

// RF-16: Registrar vacuna (con descuento opcional de inventario)
const registrarVacuna = async (mascotaId, veterinarioId, nombreVacuna, fechaAplicacion, fechaProximaDosis, productoId = null) => {
    const pool = await getConnection();
    const request = pool.request();

    request.input('MascotaId', sql.Int, mascotaId);
    request.input('VeterinarioId', sql.Int, veterinarioId);
    request.input('NombreVacuna', sql.NVarChar, nombreVacuna);
    request.input('FechaAplicacion', sql.Date, fechaAplicacion);
    request.input('FechaProximaDosis', sql.Date, fechaProximaDosis || null);
    request.input('ProductoId', sql.Int, productoId);

    let query;

    if (productoId) {
        // Con descuento de inventario (transacción)
        query = `
            DECLARE @VacunaId INT;

            BEGIN TRANSACTION;
            BEGIN TRY
                INSERT INTO VacunasMascotas (MascotaId, NombreVacuna, FechaAplicacion, FechaProximaDosis, VeterinarioId, ProductoId)
                VALUES (@MascotaId, @NombreVacuna, @FechaAplicacion, @FechaProximaDosis, @VeterinarioId, @ProductoId);

                SET @VacunaId = SCOPE_IDENTITY();

                INSERT INTO MovimientosInventario (ProductoId, UsuarioId, TipoMovimiento, Cantidad, Observacion)
                VALUES (@ProductoId, @VeterinarioId, 'Salida', 1, CONCAT('Vacuna #', @VacunaId, ' - ', @NombreVacuna));

                UPDATE Productos SET CantidadActual = CantidadActual - 1
                WHERE ProductoId = @ProductoId;

                COMMIT TRANSACTION;
                SELECT @VacunaId AS VacunaId;
            END TRY
            BEGIN CATCH
                ROLLBACK TRANSACTION;
                THROW;
            END CATCH
        `;
    } else {
        // Sin inventario (vacuna histórica o sin producto asociado)
        query = `
            INSERT INTO VacunasMascotas (MascotaId, NombreVacuna, FechaAplicacion, FechaProximaDosis, VeterinarioId, ProductoId)
            OUTPUT INSERTED.VacunaId
            VALUES (@MascotaId, @NombreVacuna, @FechaAplicacion, @FechaProximaDosis, @VeterinarioId, @ProductoId)
        `;
    }

    const result = await request.query(query);
    return result.recordset[0].VacunaId;
};

// Obtener vacunas de una mascota
const obtenerVacunasPorMascota = async (mascotaId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('MascotaId', sql.Int, mascotaId)
        .query(`
            SELECT 
                v.VacunaId,
                v.MascotaId,
                v.NombreVacuna,
                v.FechaAplicacion,
                v.FechaProximaDosis,
                v.VeterinarioId,
                u.NombreCompleto AS NombreVeterinario,
                v.ProductoId,
                p.Nombre AS NombreProducto
            FROM VacunasMascotas v
            INNER JOIN Usuarios u ON v.VeterinarioId = u.UsuarioId
            LEFT JOIN Productos p ON v.ProductoId = p.ProductoId
            WHERE v.MascotaId = @MascotaId
            ORDER BY v.FechaAplicacion DESC
        `);
    return result.recordset;
};

module.exports = {
    registrarVacuna,
    obtenerVacunasPorMascota
};
