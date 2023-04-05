import formidable from "formidable"

import { consultarReportes,
    consultarReporteUno } from "../db/sqlReportes.js"


const consultarReportesTodos = async (req, res) => {
    const listadoReportes = await consultarReportes()
    res.json(listadoReportes)
}

const consultarReporte = async (req, res) => {
    const id = req.body.id
    const reporte = await consultarReporteUno(id)
    console.log(reporte)
    if (reporte.msg) {
        return res.json(reporte)
    }
    // rcuerda crear el buffer de imagenes 
    //reporte.img_solicitud = reporte.img_solicitud.split(',')
    //const Imagenes = bufferimagenes(reporte.img_solicitud, reporte, 2)

    res.json({
        reporte,
       // Imagenes
    })
    

}

const crearReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos } = req

    const arrPermisos = JSON.parse(permisos)

    if (arrPermisos.indexOf(5) === -1) {
        res.json({msg: 'Usted no tiene permisos para crear crear reportes de mantenimeinto'})
        return
    }

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        const data = JSON.parse(fields.data)

       return res.json(data)

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarCodigoInterno(data.id_activo)

        if (dataBd.codigo !== data.codigo) {
            return res.json({ msg: 'El Id del activo no corresponde al codigo interno debe selecionar un activo valido' })
        }

        const validarDatos = validarDatoSolicitud(data)

        if (!validarDatos) {
            return res.json(validarDatos)
        }

        data.id_usuario = sessionid
        const hoy = new Date(Date.now())
        data.fecha_solicitud = hoy.toLocaleDateString()
        data.id_estado = 1
        delete data.codigo

        if (files.Image) {
            ///  sin nada para activos, 1 para solicitudes, 2 reportes
            const img_solicitud = await guardarImagenesNuevoActivo(files, dataBd, 1)
            if (img_solicitud.msg) {
                return res.json(img_solicitud)
            }
            data.img_solicitud = img_solicitud
        }

        const guardado = await guardarSolicitud(data)

        if (guardado.msg) {
            return res.json(guardado)
        }

        data.id = guardado

        const Imagenes = await bufferimagenes(data.img_solicitud, dataBd, 1) //

        res.json({
            data,
            Imagenes
        })



    });

}


export{consultarReportesTodos,
    consultarReporte,
    crearReporte
}