const cron = require("node-cron");

function iniciarNotificacionesAutomaticas() {
  cron.schedule("0 8 * * *", async () => {
    console.log("Revisando citas y vacunas automáticamente...");

    // Aquí luego se conectará con la base de datos:
    // RF-19: buscar citas de mañana
    // RF-20: buscar vacunas que vencen en 7 días
    // RF-21: listar vacunas que vencen en 30 días
  });
}

module.exports = {
  iniciarNotificacionesAutomaticas,
};