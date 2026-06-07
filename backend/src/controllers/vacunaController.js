const vacunaModel = require('../models/vacunaModel');
const { getConnection, sql } = require('../config/db');

// RF-16: Registrar vacuna
const registrarVacuna = async (req, res) => {
    try {
        const { mascotaId, nombreVacuna, fechaAplicacion, fechaProximaDosis, productoId } = req.body;
        const veterinarioId = req.usuario.usuarioId; // Viene del JWT

        // Validación de campos obligatorios
        if (!mascotaId || !nombreVacuna || !fechaAplicacion) {
            return res.status(400).json({ error: 'MascotaId, NombreVacuna y FechaAplicacion son obligatorios.' });
        }

        // Validar stock si se especifica un producto
        if (productoId) {
            const pool = await getConnection();
            const stock = await pool.request()
                .input('ProductoId', sql.Int, productoId)
                .query('SELECT ProductoId, Nombre, CantidadActual FROM Productos WHERE ProductoId = @ProductoId AND Estado = 1');

            if (stock.recordset.length === 0) {
                return res.status(400).json({ error: `Producto con ID ${productoId} no existe o está inactivo.` });
            }
            if (stock.recordset[0].CantidadActual < 1) {
                return res.status(400).json({ error: `Stock insuficiente para ${stock.recordset[0].Nombre}.` });
            }
        }

        const vacunaId = await vacunaModel.registrarVacuna(
            mascotaId, veterinarioId, nombreVacuna, fechaAplicacion, fechaProximaDosis, productoId
        );

        res.status(201).json({ mensaje: 'Vacuna registrada exitosamente.', vacunaId });
    } catch (error) {
        console.error('Error al registrar vacuna:', error);
        res.status(500).json({ error: 'Error al registrar vacuna.', detalle: error.message });
    }
};

// Ver vacunas de una mascota
const obtenerVacunasPorMascota = async (req, res) => {
    try {
        const { mascotaId } = req.params;
        const vacunas = await vacunaModel.obtenerVacunasPorMascota(parseInt(mascotaId));
        res.status(200).json(vacunas);
    } catch (error) {
        console.error('Error al obtener vacunas:', error);
        res.status(500).json({ error: 'Error al obtener vacunas.', detalle: error.message });
    }
};

module.exports = {
    registrarVacuna,
    obtenerVacunasPorMascota
};
