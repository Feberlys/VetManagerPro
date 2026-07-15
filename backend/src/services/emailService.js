const nodemailer = require('nodemailer');

const port = parseInt(process.env.EMAIL_PORT, 10) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: port,
  secure: port === 465,
  family: 4, // Forzar IPv4
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim() 
  },
  tls: {
    rejectUnauthorized: false 
  }
});

const enviarEmailGenérico = async ({ para, asunto, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Envío de correo omitido: Credenciales no configuradas");
      return; 
  }

  const opcionesElementales = {
    from: `"VetManager Pro 🐾" <${process.env.EMAIL_USER}>`,
    to: para,
    subject: asunto,
    html: html
  };

  return await transporter.sendMail(opcionesElementales);
};

// --- MÓDULO: GUARDERÍA (CHECK-OUT) ---
const enviarCorreoRecogida = async (correoCliente, nombreCliente, nombreMascota, totalCobrar, noches, precioPorNoche) => {
  const plantillaHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #059669; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">¡Check-out Confirmado! 🐾</h1>
      </div>
      <div style="padding: 24px; color: #374151; line-height: 1.6;">
        <p>Hola <strong>${nombreCliente}</strong>,</p>
        <p>Te notificamos que <strong>${nombreMascota}</strong> ha completado su estadía en nuestra guardería y ya ha sido entregado(a) formalmente.</p>
        
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111827; border-b: 1px solid #e5e7eb; padding-bottom: 8px;">Resumen de Cuenta</h3>
          <p style="margin: 6px 0;"><strong>Detalle:</strong> Hospedaje en espacio de cubículos</p>
          <p style="margin: 6px 0;"><strong>Estadía:</strong> ${noches} ${noches === 1 ? 'noche' : 'noches'} x RD$ ${precioPorNoche.toLocaleString()}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 12px 0;">
          <p style="margin: 0; font-size: 18px; color: #059669;"><strong>Total Neto:</strong> RD$ ${totalCobrar.toLocaleString()}</p>
        </div>

        <p>Gracias por confiar el cuidado de tu compañero en VetManager Pro.</p>
      </div>
    </div>
  `;

  return await enviarEmailGenérico({
    para: correoCliente,
    asunto: `Detalle de salida de ${nombreMascota} - VetManager Pro`,
    html: plantillaHTML
  });
};

// --- MÓDULO: GUARDERÍA (CHECK-IN) ---
const enviarCorreoCheckIn = async (correoCliente, nombreCliente, nombreMascota, fechaEntrada, fechaSalidaEstimada) => {
  const plantillaHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #059669; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">¡Check-in Exitoso! 🐾</h1>
      </div>
      <div style="padding: 24px; color: #374151; line-height: 1.6;">
        <p>Hola <strong>${nombreCliente}</strong>,</p>
        <p>Te confirmamos que <strong>${nombreMascota}</strong> ha ingresado a nuestra guardería de forma segura.</p>
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Fecha de entrada:</strong> ${new Date(fechaEntrada).toLocaleDateString()}</p>
          <p style="margin: 6px 0;"><strong>Salida estimada:</strong> ${new Date(fechaSalidaEstimada).toLocaleDateString()}</p>
        </div>
        <p>¡Cuidaremos muy bien de tu compañero!</p>
      </div>
    </div>
  `;
  return await enviarEmailGenérico({
    para: correoCliente,
    asunto: `Check-in de ${nombreMascota} - VetManager Pro`,
    html: plantillaHTML
  });
};

// --- RECORDATORIOS AUTOMÁTICOS ---
const enviarCorreoRecordatorioCita = async (correoCliente, nombreCliente, fechaCita) => {
  const plantillaHTML = `<h1>Recordatorio de Cita</h1><p>Hola ${nombreCliente}, te esperamos el ${fechaCita}.</p>`;
  return await enviarEmailGenérico({
    para: correoCliente,
    asunto: 'Recordatorio de tu Cita Veterinaria',
    html: plantillaHTML
  });
};

const enviarCorreoRecordatorioCheckout = async (correoCliente, nombreCliente, nombreMascota) => {
  const plantillaHTML = `<h1>Recordatorio de Recogida 🐾</h1><p>Hola ${nombreCliente}, te recordamos que mañana está programada la salida de ${nombreMascota} de nuestra guardería.</p>`;
  return await enviarEmailGenérico({
    para: correoCliente, 
    asunto: `Recordatorio de recogida de ${nombreMascota}`, 
    html: plantillaHTML
  });
};

// Exportamos todo AL FINAL del archivo para evitar el ReferenceError
module.exports = {
  enviarCorreoRecogida,
  enviarCorreoCheckIn,
  enviarCorreoRecordatorioCita,
  enviarCorreoRecordatorioCheckout
};