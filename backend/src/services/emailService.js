const nodemailer = require('nodemailer');

const port = parseInt(process.env.EMAIL_PORT, 10) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: port,
  secure: port === 465, // Si es 465 usa SSL directo automáticamente
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim() // El .trim() elimina espacios o saltos de línea invisibles del .env
  },
  tls: {
    // Esto evita que Node.js rechace la conexión si hay temas con el certificado SSL local
    rejectUnauthorized: false 
  }
});

// Esto nos dirá exactamente qué está fallando en la consola al arrancar
/*transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error detallado de SMTP:', error);
  } else {
    console.log('🚀 Servidor de correos listo para enviar notificaciones');
  }
});*/

/**
 * Función núcleo (Core) - Envía cualquier correo recibiendo los parámetros básicos.
 * Esto evita repetir código de transporte en otros módulos.
 */
const enviarEmailGenérico = async ({ para, asunto, html }) => {
  // Verificamos si las variables existen antes de intentar enviar
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
/**
 * Plantillas específicas por Módulo
 * Aquí es donde manejas la diferente información que requiere cada pantalla.
 */

// --- MÓDULO 6: GUARDERÍA ---
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
      <div style="background-color: #f3f4f6; padding: 12px; text-align: center; font-size: 12px; color: #6b7280;">
        © 2026 VetManager Pro. Todos los derechos reservados.
      </div>
    </div>
  `;

  return await enviarEmailGenérico({
    para: correoCliente,
    asunto: `Detalle de salida de ${nombreMascota} - VetManager Pro`,
    html: plantillaHTML
  });
};

// --- EJEMPLO PARA FUTUROS MÓDULOS (Citas, Facturas, etc.) ---
const enviarCorreoRecordatorioCita = async (correoCliente, nombreCliente, fechaCita) => {
  const plantillaHTML = `<h1>Recordatorio de Cita</h1><p>Hola ${nombreCliente}, te esperamos el ${fechaCita}.</p>`;
  return await enviarEmailGenérico({
    para: correoCliente,
    asunto: 'Recordatorio de tu Cita Veterinaria',
    html: plantillaHTML
  });
};

module.exports = {
  enviarCorreoRecogida,
  enviarCorreoRecordatorioCita // Lo exportas conforme lo vayas necesitando
};