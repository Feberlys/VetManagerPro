const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'b2261b001@smtp-brevo.com',
    pass: (process.env.EMAIL_PASS || '').trim()
  }
});

// Esta función es ahora "blindada": si falla, no detiene el servidor
const enviarEmailGenérico = async (opciones) => {
  try {
    if (!process.env.EMAIL_PASS) return; // Si no hay pass, no hacemos nada
    return await transporter.sendMail(opciones);
  } catch (error) {
    console.error("⚠️ Correo fallido (omitido para no detener el sistema):", error.message);
    return; // Retornamos vacío para que el flujo siga
  }
};

// Tus funciones ahora usan ese blindaje automáticamente
const enviarCorreoRecogida = async (c, n, m, t, nch, p) => 
  await enviarEmailGenérico({ para: c, asunto: "Salida", html: `...` });

const enviarCorreoCheckIn = async (c, n, m, e, s) => 
  await enviarEmailGenérico({ para: c, asunto: "Check-in", html: `...` });

const enviarCorreoRecordatorioCita = async (c, n, f) => 
  await enviarEmailGenérico({ para: c, asunto: "Cita", html: `...` });

const enviarCorreoRecordatorioCheckout = async (c, n, m) => 
  await enviarEmailGenérico({ para: c, asunto: "Recogida", html: `...` });

module.exports = {
  enviarCorreoRecogida,
  enviarCorreoCheckIn,
  enviarCorreoRecordatorioCita,
  enviarCorreoRecordatorioCheckout
};