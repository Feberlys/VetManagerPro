const transporter = require("../config/emailConfig");

async function enviarCorreo(destinatario, asunto, mensaje) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      text: mensaje,
    });

    return {
      success: true,
      message: "Correo enviado correctamente",
    };
  } catch (error) {
    console.error("Error enviando correo:", error);

    return {
      success: false,
      message: "Error al enviar el correo",
      error: error.message,
    };
  }
}

module.exports = {
  enviarCorreo,
};