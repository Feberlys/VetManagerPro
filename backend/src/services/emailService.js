const nodemailer = require('nodemailer');

// --- CONFIGURACIÓN SMTP PARA BREVO ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Asegúrate en Render que sea smtp-relay.brevo.com
  port: parseInt(process.env.EMAIL_PORT, 10), // 587
  secure: false, // Requerido para puerto 587
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

  const opcionesElementales = {
    from: `"VetManager Pro 🐾" <${process.env.EMAIL_USER.trim()}>`, // Usamos el mismo user validado en Brevo
    to: para,
    subject: asunto,
    html: html
  };

  return await transporter.sendMail(opcionesElementales);
};

// --- MÓDULOS (Recogida, Check-in, Recordatorios) ---
// (Mantenemos tus funciones igual, solo aseguramos que el 'from' sea dinámico o coherente)
// ... (aquí van todas tus funciones de enviarCorreoRecogida, enviarCorreoCheckIn, etc.)

// --- EXPORTACIÓN ---
module.exports = {
  enviarCorreoRecogida,
  enviarCorreoCheckIn,
  enviarCorreoRecordatorioCita,
  enviarCorreoRecordatorioCheckout
};