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
// FIX RF-15: Incluye citas "Atendidas" (M3) que aún no tienen registro de historial
// FIX RF-14: Incluye MotivoCita y FechaCitaOriginal para mostrar info completa
const obtenerHistorialPorMascota = async (mascotaId) => {
    const pool = await getConnection();

    const consultas = await pool.request()
        .input('MascotaId', sql.Int, mascotaId)
        .query(`
            -- Consultas registradas manualmente por el veterinario (RF-14)
            SELECT
                h.HistorialId,
                h.MascotaId,
                h.CitaId,
                h.VeterinarioId,
                u.NombreCompleto    AS NombreVeterinario,
                h.Diagnostico,
                h.Tratamiento,
                h.NotasAdicionales,
                h.FechaConsulta,
                c.Motivo            AS MotivoCita,
                c.FechaHora         AS FechaCitaOriginal,
                'historial'         AS TipoRegistro
            FROM HistorialMedico h
            INNER JOIN Usuarios u ON h.VeterinarioId = u.UsuarioId
            LEFT  JOIN Citas     c ON h.CitaId = c.CitaId
            WHERE h.MascotaId = @MascotaId

            UNION ALL

            -- Citas Atendidas de M3 que todavía no tienen historial médico (RF-15)
            SELECT
                NULL                AS HistorialId,
                c.MascotaId,
                c.CitaId,
                c.VeterinarioId,
                u.NombreCompleto    AS NombreVeterinario,
                c.Motivo            AS Diagnostico,
                NULL                AS Tratamiento,
                NULL                AS NotasAdicionales,
                c.FechaHora         AS FechaConsulta,
                c.Motivo            AS MotivoCita,
                c.FechaHora         AS FechaCitaOriginal,
                'cita_atendida'     AS TipoRegistro
            FROM Citas c
            INNER JOIN Usuarios u ON c.VeterinarioId = u.UsuarioId
            WHERE c.MascotaId    = @MascotaId
              AND c.EstadoCitaId = 2
              AND NOT EXISTS (
                  SELECT 1 FROM HistorialMedico h2
                  WHERE h2.CitaId = c.CitaId
              )

            ORDER BY FechaConsulta DESC
        `);

    // Traer productos con manejo de error: si la tabla HistorialProductos
    // aún no existe (delta pendiente), devuelve array vacío en lugar de explotar
    let productosData = [];
    try {
        const productos = await pool.request()
            .input('MascotaId', sql.Int, mascotaId)
            .query(`
                SELECT
                    hp.HistorialId,
                    hp.ProductoId,
                    p.Nombre AS NombreProducto,
                    hp.Cantidad
                FROM HistorialProductos hp
                INNER JOIN Productos       p ON hp.ProductoId  = p.ProductoId
                INNER JOIN HistorialMedico h ON hp.HistorialId = h.HistorialId
                WHERE h.MascotaId = @MascotaId
            `);
        productosData = productos.recordset;
    } catch (err) {
        console.warn('[Historial] HistorialProductos no disponible aún:', err.message);
    }

    return consultas.recordset.map(c => ({
        ...c,
        productosUsados: productosData.filter(p => p.HistorialId === c.HistorialId)
    }));
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
                m.Nombre            AS NombreMascota,
                h.CitaId,
                h.VeterinarioId,
                u.NombreCompleto    AS NombreVeterinario,
                h.Diagnostico,
                h.Tratamiento,
                h.NotasAdicionales,
                h.FechaConsulta,
                c.Motivo            AS MotivoCita,
                c.FechaHora         AS FechaCitaOriginal
            FROM HistorialMedico h
            INNER JOIN Usuarios u ON h.VeterinarioId = u.UsuarioId
            INNER JOIN Mascotas m ON h.MascotaId = m.MascotaId
            LEFT  JOIN Citas    c ON h.CitaId = c.CitaId
            WHERE h.HistorialId = @HistorialId
        `);

    let productosData = [];
    try {
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
        productosData = productos.recordset;
    } catch (err) {
        console.warn('[Historial] HistorialProductos no disponible aún:', err.message);
    }

    if (consulta.recordset.length === 0) return null;

    return {
        ...consulta.recordset[0],
        productosUsados: productosData
    };
};

module.exports = {
    crearConsulta,
    obtenerHistorialPorMascota,
    obtenerConsultaPorId
};
