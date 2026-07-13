const historialModel = require('../models/historialModel');
const { sql, getConnection } = require('../config/db');

// RF-14: Registrar consulta médica con productos
const crearConsulta = async (req, res) => {
    try {
        const { mascotaId, citaId, diagnostico, tratamiento, notasAdicionales, productosUsados } = req.body;
        const veterinarioId = req.usuario?.usuarioId || req.usuario?.id || 1;

        if (!mascotaId || !diagnostico) {
            return res.status(400).json({ error: 'MascotaId y Diagnostico son obligatorios.' });
        }

        const pool = await getConnection();

        // 1. Validar Stock
        if (productosUsados && productosUsados.length > 0) {
            for (const prod of productosUsados) {
                const stock = await pool.request()
                    .input('ProductoId', sql.Int, prod.productoId)
                    .query('SELECT Nombre, CantidadActual FROM Productos WHERE ProductoId = @ProductoId AND Estado = 1');

                if (stock.recordset.length === 0) {
                    return res.status(400).json({ error: `El producto ID ${prod.productoId} no existe.` });
                }
                if (stock.recordset[0].CantidadActual < prod.cantidad) {
                    return res.status(400).json({ error: `Stock insuficiente para ${stock.recordset[0].Nombre}.` });
                }
            }
        }

        // 2. Registrar Consulta
        const historialId = await historialModel.crearConsulta(
            mascotaId, citaId, veterinarioId, diagnostico, tratamiento, notasAdicionales, productosUsados || []
        );

        // 3. DESCONTAR INVENTARIO Y GUARDAR AUDITORÍA
        if (productosUsados && productosUsados.length > 0) {
            for (const prod of productosUsados) {
                await pool.request()
                    .input('cant', sql.Int, prod.cantidad)
                    .input('pId', sql.Int, prod.productoId)
                    .query('UPDATE Productos SET CantidadActual = CantidadActual - @cant WHERE ProductoId = @pId');
                
                await pool.request()
                    .input('prodId', sql.Int, prod.productoId)
                    .input('usrId', sql.Int, veterinarioId)
                    .input('tipo', sql.VarChar, 'Salida')
                    .input('canti', sql.Int, prod.cantidad)
                    .input('obs', sql.VarChar, `Consulta Médica - Mascota #${mascotaId}`)
                    .query(`
                        INSERT INTO MovimientosInventario 
                        (ProductoId, UsuarioId, TipoMovimiento, Cantidad, FechaMovimiento, Observacion)
                        VALUES (@prodId, @usrId, @tipo, @canti, GETDATE(), @obs)
                    `);
            }
        }

        res.status(201).json({ mensaje: 'Consulta registrada e inventario actualizado.', historialId });
    } catch (error) {
        console.error('❌ Error al registrar consulta:', error);
        res.status(500).json({ error: 'Error interno del servidor.', detalle: error.message });
    }
};

// RF-15 + RF-17: Ver historial de una mascota
const obtenerHistorialPorMascota = async (req, res) => {
    try {
        const { mascotaId } = req.params;
        const historial = await historialModel.obtenerHistorialPorMascota(parseInt(mascotaId));
        res.status(200).json(historial);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial.', detalle: error.message });
    }
};

// Detalle de una consulta con productos usados
const obtenerConsultaPorId = async (req, res) => {
    try {
        const { historialId } = req.params;
        const consulta = await historialModel.obtenerConsultaPorId(parseInt(historialId));

        if (!consulta) {
            return res.status(404).json({ error: 'Consulta no encontrada.' });
        }

        res.status(200).json(consulta);
    } catch (error) {
        console.error('Error al obtener consulta:', error);
        res.status(500).json({ error: 'Error al obtener consulta.', detalle: error.message });
    }
};

// EXPORTACIONES CORREGIDAS
module.exports = {
    crearConsulta,
    obtenerHistorialPorMascota,
    obtenerConsultaPorId
};