const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: (process.env.EMAIL_USER || '').trim(),
    pass: (process.env.EMAIL_PASS || '').trim()
  }
});

const enviarEmailGenérico = async ({ para, asunto, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Envío de correo omitido: Credenciales no configuradas");
      return; 
  }
  return await transporter.sendMail({
    from: `"VetManager Pro 🐾" <${process.env.EMAIL_USER.trim()}>`,
    to: para,
    subject: asunto,
    html: html
  });
};

// --- TODAS LAS FUNCIONES DEFINIDAS ---
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

// --- EXPORTACIÓN CORRECTA ---
module.exports = {
  enviarCorreoRecogida,
  enviarCorreoCheckIn,
  enviarCorreoRecordatorioCita,
  enviarCorreoRecordatorioCheckout
};