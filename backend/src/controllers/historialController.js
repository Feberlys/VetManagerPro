const historialModel = require('../models/historialModel');
const { getConnection, sql } = require('../config/db');

// RF-14: Registrar consulta médica con productos
const crearConsulta = async (req, res) => {
    try {
        const { mascotaId, citaId, diagnostico, tratamiento, notasAdicionales, productosUsados } = req.body;
        const veterinarioId = req.usuario.usuarioId; // Viene del JWT

        // Validación de campos obligatorios
        if (!mascotaId || !diagnostico) {
            return res.status(400).json({ error: 'MascotaId y Diagnostico son obligatorios.' });
        }

        // Validar stock antes de la transacción
        if (productosUsados && productosUsados.length > 0) {
            const pool = await getConnection();

            for (const prod of productosUsados) {
                if (!prod.productoId || !prod.cantidad || prod.cantidad <= 0) {
                    return res.status(400).json({ error: 'Cada producto debe tener productoId y cantidad mayor a 0.' });
                }

                const stock = await pool.request()
                    .input('ProductoId', sql.Int, prod.productoId)
                    .query('SELECT ProductoId, Nombre, CantidadActual FROM Productos WHERE ProductoId = @ProductoId AND Estado = 1');

                if (stock.recordset.length === 0) {
                    return res.status(400).json({ error: `Producto con ID ${prod.productoId} no existe o está inactivo.` });
                }
                if (stock.recordset[0].CantidadActual < prod.cantidad) {
                    return res.status(400).json({
                        error: `Stock insuficiente para ${stock.recordset[0].Nombre}. Disponible: ${stock.recordset[0].CantidadActual}, Solicitado: ${prod.cantidad}`
                    });
                }
            }
        }

        const historialId = await historialModel.crearConsulta(
            mascotaId, citaId, veterinarioId, diagnostico, tratamiento, notasAdicionales, productosUsados || []
        );

        res.status(201).json({ mensaje: 'Consulta registrada exitosamente.', historialId });
    } catch (error) {
        console.error('Error al registrar consulta:', error);
        res.status(500).json({ error: 'Error al registrar consulta.', detalle: error.message });
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

module.exports = {
    crearConsulta,
    obtenerHistorialPorMascota,
    obtenerConsultaPorId
};
