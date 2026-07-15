const cron = require("node-cron");
const emailService = require('../services/emailService');
const { getConnection } = require('../config/db'); // Ajusta la ruta a tu archivo de conexión BD

function iniciarNotificacionesAutomaticas() {
  // Se ejecuta todos los días a las 8:00 AM hora del servidor
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Iniciando trabajo automático de notificaciones...");
    try {
      const pool = await getConnection();

      // 1. RF-19: Recordatorios de Citas de Mañana
      const citasManana = await pool.request().query(`
        SELECT c.FechaHora, m.Nombre as NombreMascota, cl.NombreCompleto as NombreCliente, cl.Correo
        FROM Citas c
        INNER JOIN Mascotas m ON c.MascotaId = m.MascotaId
        INNER JOIN Clientes cl ON m.ClienteId = cl.ClienteId
        WHERE CAST(c.FechaHora AS DATE) = CAST(DATEADD(day, 1, GETDATE()) AS DATE)
        AND c.EstadoCitaId = 1 AND cl.Correo IS NOT NULL
      `);

      for (let cita of citasManana.recordset) {
        await emailService.enviarCorreoRecordatorioCita(
          cita.Correo, cita.NombreCliente, new Date(cita.FechaHora).toLocaleString('es-DO')
        );
      }
      console.log(`✅ Recordatorios de citas enviados: ${citasManana.recordset.length}`);

      // 2. NUEVO: Recordatorios de Check-out de Guardería para mañana
      const checkoutsManana = await pool.request().query(`
        SELECT h.FechaSalidaEstimada, m.Nombre as NombreMascota, cl.NombreCompleto as NombreCliente, cl.Correo
        FROM Hospedajes h
        INNER JOIN Mascotas m ON h.MascotaId = m.MascotaId
        INNER JOIN Clientes cl ON m.ClienteId = cl.ClienteId
        WHERE CAST(h.FechaSalidaEstimada AS DATE) = CAST(DATEADD(day, 1, GETDATE()) AS DATE)
        AND h.Estado = 'Activo' AND cl.Correo IS NOT NULL
      `);

      for (let checkout of checkoutsManana.recordset) {
        await emailService.enviarCorreoRecordatorioCheckout(
          checkout.Correo, checkout.NombreCliente, checkout.NombreMascota
        );
      }
      console.log(`✅ Recordatorios de guardería enviados: ${checkoutsManana.recordset.length}`);

    } catch (error) {
      console.error("❌ Error en el Cron Job de notificaciones:", error.message);
    }
  });
}

module.exports = {
  iniciarNotificacionesAutomaticas,
};