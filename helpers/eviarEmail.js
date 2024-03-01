
//CliofCos7Soporte
//soportecliof@gmail.com

import nodemailer from 'nodemailer';

const enviarCorreo = async datos => {
    console.log(datos)
    // Configura el transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });
    console.log(transporter)
    // Configura los datos del correo electrónico
    const mailOptions = {
        from: process.env.EMAIL,
        to: 'asistentedecalidad@cliofsincelejo.com, seguridadysaludeneltrabajocos@gmail.com  ',
        subject: 'prueba de envio',
        text: 'esto es una prueba ',
        // attachments: [
        //     {
        //         filename: 'documento_adjunto.pdf',
        //         path: 'C:/Users/USER/Download/Factura-524hhssss-Ins-1.pdf'
        //     }
        // ]
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response)
    } catch (error) {
        console.error('Error al enviar el correo:', error)
    }
}

export { enviarCorreo }