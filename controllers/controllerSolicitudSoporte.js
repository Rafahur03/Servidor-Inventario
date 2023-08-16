import formidable from "formidable"
import { validarDatoSolicitud } from "../helpers/validarDatosSolicitud.js"
// verificar ubo cambios import { validarFiles } from "../helpers/validarFiles.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
import { crearPdfMake } from "../helpers/crearPdfMake.js"
import {
    guardarImagenesNuevoActivo,
    bufferimagenes,
    elimnarImagenes,
    elimnarImagenesSoliRepor,
    guardarImagenesBase64
} from "../helpers/copiarCarpetasArchivos.js"
import {
    consultarSolicitudes,
    guardarSolicitud,
    consultarSolicitudUno,
    actualizarSolicitud,
    eliminarSolicitudDb,
    actualizarImagenesSolicitud
} from "../db/sqlSolicitudes.js"

import { validarImagenes } from "../helpers/validarFiles.js"
import { dataSolicitud } from "../db/sqlPdf.js"

const consultarSolicitudTodos = async (req, res) => {
    const solicitudes = await consultarSolicitudes()
    if (solicitudes.msg) {
        return res.json(solicitudes[0])
    }
    solicitudes.forEach(element => {
        element.fecha_solicitud = element.fecha_solicitud.toLocaleDateString('es-CO')
    });
    res.json(solicitudes)

}

const consultarSolicitud = async (req, res) => {
    const id = req.body.id
    const solicitud = await consultarSolicitudUno(id)
    if (solicitud.msg) {
        return res.json(solicitud)
    }
    const dataBd = await consultarCodigoInterno(solicitud.id_activo)
    if (solicitud.img_solicitud !== '' && solicitud.img_solicitud !== null) {
        solicitud.img_solicitud = solicitud.img_solicitud.split(',')
        dataBd.idSolicitud = solicitud.id
        const imagenesSolicitud = await bufferimagenes(solicitud.img_solicitud, dataBd, 1)
        solicitud.imagenesSolicitud =  imagenesSolicitud
    }

    solicitud.imagenes_Activo = solicitud.imagenes_Activo.split(',')
    const imagenesActivo = await bufferimagenes(solicitud.imagenes_Activo, dataBd)
    solicitud.imagenesActivo = imagenesActivo
    solicitud.fecha_solicitud = solicitud.fecha_solicitud.toISOString().substring(0, 10)

    res.json(
        solicitud
    )


}

const crearSolicitud = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid } = req

    const data = req.body
    const activo = data.idActivo.split('-')[1]
    // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
    const dataBd = await consultarCodigoInterno(activo)
    if (activo.msg) return res.json({ msg: 'El activo no es valido o no existe' })

    // validar datos y files
    const validarDatos = validarDatoSolicitud(data)

    if (validarDatos.msg) return res.json(validarDatos)

    let imagenes = null
    if (data.imagenes.length > 0) {
        for (let imagen of data.imagenes) {
            const validacionImagen = validarImagenes(imagen)
            if (validacionImagen.msg) return res.json(validacionImagen)
        }
        imagenes = data.imagenes
        delete data.imagenes
    }
    data.id_activo = activo
    data.solicitud = data.descripcion
    data.id_usuario = sessionid
    data.fecha_solicitud = new Date(Date.now()).toISOString().substring(0, 10)
    data.id_estado = 1
    delete data.idActivo
    delete data.descripcion

    const guardado = await guardarSolicitud(data)
    if (guardado.msg) {
        return res.json(guardado)
    }
    dataBd.idSolicitud = guardado


    if (imagenes !== null) {
      
        const nombreImagenes = []
        for (const imagen of imagenes) {
            const guardarImagen = await guardarImagenesBase64(imagen, dataBd, 1);
            if (!guardarImagen.msg) nombreImagenes.push(guardarImagen);
        }
        // guardar imagenes y actualizar en la base de datos.

        if (nombreImagenes.length > 0) {
            const datos = {
                id: guardado,
                img_solicitud: nombreImagenes.toString()
            }
            const guardadoImagenes = await actualizarImagenesSolicitud(datos)

            if(!guardadoImagenes.msg) data.img_solicitud = nombreImagenes
        }


    }

    data.id = guardado
    if(data.img_solicitud){
        const Imagenes = await bufferimagenes(data.img_solicitud, dataBd, 1) //
        return res.json({
            data,
            Imagenes
        })
    }
    
    res.json({
        data
    })

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

        // validar datos y files
        const validarDatos = validarDatoSolicitud(data)

        if (!validarDatos.msg) {
            return res.json(validarDatos)
        }

        const validarFile = validarFiles(files)
        if (!validarFile.msg) {
            return res.json(validarFile)
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