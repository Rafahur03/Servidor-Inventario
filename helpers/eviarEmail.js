
import nodemailer from 'nodemailer';

const enviarCorreo = async datos => {

    // Configura el transporter
    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
           
        }
    });
    transporter.verify(function (error, success) {
        if (error) {
            console.log('Hubo un error al conectar con el servidor de gmail ' +  error)
            return false
        } else {
            console.log('Server is ready to take our messages');
        }
    });

    // Configura los datos del correo electrónico
    const mailOptions = {
        from: process.env.EMAIL,
        to: 'asistentedecalidad@cliofsincelejo.com, seguridadysaludeneltrabajocos@gmail.com',
        subject: datos.asunto,
        text: datos.mensaje,
        attachments: [
            {
            
                filename: datos.nombre,
                content: datos.base64.includes('data:application/pdf;base64') ? datos.base64.split(',')[1] : datos.base64,
                encoding: 'base64'
            }
        ]
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado:', info.response)
    } catch (error) {
        console.error('Error al enviar el correo:', error)
    }
}

export { enviarCorreo }
