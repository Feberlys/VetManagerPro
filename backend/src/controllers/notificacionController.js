const {
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarAvisoVacuna,
} = require("../services/notificacionService");

async function confirmarCita(req, res) {
  try {
    const resultado = await enviarConfirmacionCita(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al enviar confirmación de cita",
      error: error.message,
    });
  }
}

async function recordarCita(req, res) {
  try {
    const resultado = await enviarRecordatorioCita(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al enviar recordatorio de cita",
      error: error.message,
    });
  }
}

async function avisarVacuna(req, res) {
  try {
    const resultado = await enviarAvisoVacuna(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "Error al enviar aviso de vacuna",
      error: error.message,
    });
  }
}

module.exports = {
  confirmarCita,
  recordarCita,
  avisarVacuna,
};