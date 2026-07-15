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
  // Quitamos el 'await' del envío y lo gestionamos de forma independiente
  if (!process.env.EMAIL_PASS) return;

  transporter.sendMail(opciones)
    .then(() => console.log("✅ Correo enviado con éxito"))
    .catch((error) => console.error("⚠️ Error silencioso en correo:", error.message));
  
  // Retornamos inmediatamente para que el checkout no se bloquee
  return;
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