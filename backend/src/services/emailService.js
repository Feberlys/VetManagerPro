const nodemailer = require('nodemailer');

// Usamos el operador de coalescencia nula (??) para evitar que sea undefined
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
      console.error("⚠️ ERROR CRÍTICO: EMAIL_PASS está vacía en Render.");
      return; 
  }
  
  return await transporter.sendMail({
    from: `"VetManager Pro 🐾" <b2261b001@smtp-brevo.com>`,
    to: para,
    subject: asunto,
    html: html
  });
};

// --- MANTÉN AQUÍ TUS FUNCIONES ENVIARCORREORECOGIDA, ETC. ---
// ... (asegúrate de que todas tus funciones estén aquí)

module.exports = {
  enviarCorreoRecogida,
  enviarCorreoCheckIn,
  enviarCorreoRecordatorioCita,
  enviarCorreoRecordatorioCheckout
};