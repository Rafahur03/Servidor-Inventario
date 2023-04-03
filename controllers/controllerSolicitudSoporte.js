import formidable from "formidable"

import { consultarSolicitudes } from "../db/sqlSolicitudes.js"

const consultarSoportesTodos = async(req, res) =>{
    const solicitudes = await consultarSolicitudes()
    if (solicitudes.msg){
        return resizeBy.json(solicitudes[0])
    }

    res.json(solicitudes)

}

const crearSolicitud = async (req, res) => {

    // validar permisos para crear activos
    const {sessionid} = req


    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {
        
        if (err) {
            console.error(err); 
            return res.status(500).json({ error: err });
        }        

        res.json(fields.data)

    });
}

export {
    consultarSoportesTodos,
    crearSolicitud
}