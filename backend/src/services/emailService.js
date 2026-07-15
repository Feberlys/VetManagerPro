const nodemailer = require('nodemailer');

// Blindaje contra variables de entorno inexistentes
const passwordSMTP = process.env.EMAIL_PASS ?? '';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'b2261b001@smtp-brevo.com',
    pass: passwordSMTP.trim()
  }
});

const enviarEmailGenérico = async ({ para, asunto, html }) => {
  if (!passwordSMTP) {
      console.error("⚠️ ERROR CRÍTICO: EMAIL_PASS no configurada en Render.");
      return; 
  }
  return await transporter.sendMail({
    from: `"VetManager Pro 🐾" <b2261b001@smtp-brevo.com>`,
    to: para,
    subject: asunto,
    html: html
  });
};

// --- FUNCIONES NECESARIAS ---
const enviarCorreoRecogida = async (correo, nombre, mascota, total, noches, precio) => {
  return await enviarEmailGenérico({ para: correo, asunto: "Detalle de salida", html: `<p>Hola ${nombre}, ${mascota} salió. Total: ${total}</p>` });
};

const enviarCorreoCheckIn = async (correo, nombre, mascota, e, s) => {
  return await enviarEmailGenérico({ para: correo, asunto: "Check-in", html: `<p>Hola ${nombre}, ${mascota} ingresó.</p>` });
};

const enviarCorreoRecordatorioCita = async (correo, nombre, fecha) => {
  return await enviarEmailGenérico({ para: correo, asunto: "Cita", html: `<p>Hola ${nombre}, te esperamos el ${fecha}.</p>` });
};

const enviarCorreoRecordatorioCheckout = async (correo, nombre, mascota) => {
  return await enviarEmailGenérico({ para: correo, asunto: "Recogida", html: `<p>Hola ${nombre}, mañana sale ${mascota}.</p>` });
};

// --- EXPORTACIÓN ---
module.exports = {
  enviarCorreoRecogida,
  enviarCorreoCheckIn,
  enviarCorreoRecordatorioCita,
  enviarCorreoRecordatorioCheckout
};