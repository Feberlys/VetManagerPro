const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreoRecogida = async (
    correoDestino,
    nombreCliente,
    nombreMascota,
    totalCobrar
) => {

    await transporter.sendMail({
        from: `"VetManager Pro" <${process.env.EMAIL_USER}>`,
        to: correoDestino,
        subject: 'Su mascota está lista para ser recogida',
        html: `
            <h2>VetManager Pro</h2>

            <p>Hola ${nombreCliente},</p>

            <p>
                Le informamos que su mascota
                <strong>${nombreMascota}</strong>
                ha finalizado su estadía en nuestra guardería.
            </p>

            <p>
                Ya puede pasar a recogerla.
            </p>

            <p>
                <strong>Total a pagar:</strong>
                RD$ ${totalCobrar}
            </p>

            <br>

            <p>
                Gracias por confiar en VetManager Pro.
            </p>
        `
    });

    console.log(`📧 Correo enviado a ${correoDestino}`);
};

module.exports = {
    enviarCorreoRecogida
};