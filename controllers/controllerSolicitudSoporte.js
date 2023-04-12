import formidable from "formidable"

import { validarDatoSolicitud } from "../helpers/validarDatosSolicitud.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
import {
    guardarImagenesNuevoActivo,
    bufferimagenes,
    elimnarImagenes,
    elimnarImagenesSoliRepor
} from "../helpers/copiarCarpetasArchivos.js"
import {
    consultarSolicitudes,
    guardarSolicitud,
    consultarSolicitudUno,
    actualizarSolicitud,
    eliminarSolicitudDb
} from "../db/sqlSolicitudes.js"

const consultarSolicitudTodos = async (req, res) => {
    const solicitudes = await consultarSolicitudes()
    if (solicitudes.msg) {
        return resizeBy.json(solicitudes[0])
    }

    res.json(solicitudes)

}

const consultarSolicitud = async (req, res) => {
    const id = req.body.id
    const solicitud = await consultarSolicitudUno(id)
    if (solicitud.msg) {
        return res.json(solicitud)
    }
    
    solicitud.img_solicitud = solicitud.img_solicitud.split(',')
    const Imagenes = bufferimagenes(solicitud.img_solicitud, solicitud, 1)

    res.json({
        solicitud,
        Imagenes
    })
    

}

const crearSolicitud = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid } = req

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        const data = JSON.parse(fields.data)

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
        data.fecha_solicitud = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
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

const modificarSolicitud = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos } = req

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        const data = JSON.parse(fields.data)

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarSolicitud(data.id)

        if (dataBd.id_estado !== 1) {
            return res.json({ msg: 'La solictud ya ha sido gestionada su estado es diferente de Abierto' })
        }

        if (dataBd.id_usuario !== sessionid) {
            const arrPermisos = JSON.parse(permisos)
            if (arrPermisos.indexOf(5) === -1) {
                return res.json({ msg: 'Usted no tiene permisos para modificar solicitudes' })
            } else {
                return res.json({ msg: 'Esta solicitud Fue radicada por otro usuario.' })
            }
        }

        const validarDatos = validarDatoSolicitud(data)

        if (!validarDatos) {
            return res.json(validarDatos)
        }

        // validar si se elimino alguna imagen
        if (data.img_solicitud.length <= 0 && !files.Image) {
            return res.json({ msg: 'No se puede eliminar todas las imagenes' })
        }

        let imageneDb = dataBd.img_solicitud.split(',')
        const ElminoImagen = JSON.stringify(imageneDb) === JSON.stringify(data.img_solicitud)

        let imagenesEliminar

        if (!ElminoImagen) {
            imagenesEliminar = imageneDb.filter(image => !data.img_solicitud.includes(image))
        }

        if (files.Image) {
            const nuevaUrl_imag = await guardarImagenesNuevoActivo(files, dataBd, 1)
            if (nuevaUrl_imag.msg) {
                return res.json(nuevaUrl_imag)
            }
            const nuevasImages = nuevaUrl_imag.concat(data.img_solicitud)
            data.img_solicitud = nuevasImages
        }
        if (!ElminoImagen) {
            await elimnarImagenes(imagenesEliminar, dataBd, 1)
        }
        data.img_solicitud = data.img_solicitud.toString()

        console.log(data)

        const actualizar = await actualizarSolicitud(data)
        if (actualizar.msg) {
            return res.json(actualizar)
        }

        data.img_solicitud = data.img_solicitud.split(',')

        const Imagenes = bufferimagenes(data.img_solicitud, dataBd, 1)


        // enviar respuesta con los datos del activo e imagenes
        res.json({
            msg: 'Activo actualizado correctamente',
            data,
            Imagenes
        })
    });
}

const eliminarSolicitud = async (req, res) => {
    const { sessionid, permisos } = req
    const id = req.body

    // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
    const dataBd = await consultarSolicitud(id.id)
  
    if (dataBd.id_estado !== 1) {
        return res.json({ msg: 'La solictud ya ha sido gestionada su estado es diferente de Abierto no se puede eliminarla solicitud' })
    }

    if (dataBd.id_usuario !== sessionid) {
        const arrPermisos = JSON.parse(permisos)
        if (arrPermisos.indexOf(5) === -1) {
            return res.json({ msg: 'Usted no tiene permisos para modificar solicitudes' })
        } else {
            return res.json({ msg: 'Esta solicitud Fue radicada por otro usuario.' })
        }
    }

    const eliminado = await eliminarSolicitudDb(dataBd.id)
    if (eliminado.msg) {
        return res.json(eliminado.msg)
    }
    
    const img_solicitud = dataBd.img_solicitud.split(',')
    const carpetaEliminada = elimnarImagenesSoliRepor(img_solicitud, dataBd, 1)
    if (carpetaEliminada.msg) {
        return res.json(carpetaEliminada)
    }
    

    res.json({
        msg: 'Eliminado Correctamete',
    })
}

export {
    consultarSolicitudTodos,
    crearSolicitud,
    modificarSolicitud,
    eliminarSolicitud,
    consultarSolicitud
}