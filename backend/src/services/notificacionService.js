const { enviarCorreo } = require("./emailService");

async function enviarConfirmacionCita(cita) {
  const asunto = "Confirmación de cita veterinaria";

  const mensaje = `
Hola ${cita.nombreDueno},

Su cita ha sido agendada correctamente.

Mascota: ${cita.nombreMascota}
Fecha: ${cita.fecha}
Hora: ${cita.hora}

Gracias por confiar en VetManagerPro.
`;

  return await enviarCorreo(cita.emailDueno, asunto, mensaje);
}

async function enviarRecordatorioCita(cita) {
  const asunto = "Recordatorio de cita veterinaria";

  const mensaje = `
Hola ${cita.nombreDueno},

Le recordamos que mañana tiene una cita programada.

Mascota: ${cita.nombreMascota}
Fecha: ${cita.fecha}
Hora: ${cita.hora}

VetManagerPro.
`;

  return await enviarCorreo(cita.emailDueno, asunto, mensaje);
}

async function enviarAvisoVacuna(vacuna) {
  const asunto = "Aviso de vacuna próxima a vencer";

  const mensaje = `
Hola ${vacuna.nombreDueno},

La vacuna de su mascota está próxima a vencer.

Mascota: ${vacuna.nombreMascota}
Vacuna: ${vacuna.nombreVacuna}
Fecha de vencimiento: ${vacuna.fechaVencimiento}

Favor agendar una cita con la clínica.
`;

  return await enviarCorreo(vacuna.emailDueno, asunto, mensaje);
}

module.exports = {
  enviarConfirmacionCita,
  enviarRecordatorioCita,
  enviarAvisoVacuna,
};