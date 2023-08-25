import formidable from "formidable"
import { validarDatoReporte } from "../helpers/validarDatosReporte.js"
// validar cambio de funcion import { validarFiles } from "../helpers/validarFiles.js"
import { consultarCodigoInterno, actualizarEstadoyFechaActivo } from "../db/sqlActivos.js"
import { consultaValidarSolicitudReporte, actualizarEstadoSolicitud } from "../db/sqlSolicitudes.js"
import { crearPdfMake } from "../helpers/crearPdfMake.js"
import { validarImagenes, validarDocumentos } from "../helpers/validarFiles.js"
import {
    guardarImagenesNuevoActivo,
    bufferimagenes,
    eliminarImagenes,
    guardarPDF,
    guadarReporteFinal,
    bufferReporte,
    guardarImagenesBase64,
    guardarDocumentoBase64,
} from "../helpers/copiarCarpetasArchivos.js"

import {
    consultarReportes,
    consultarReporteUno,
    guardarReporte,
    actualizarReporte,
    dataConfReporte,
    actualizarImagenesReporte
} from "../db/sqlReportes.js"


const consultarReportesTodos = async (req, res) => {
    const listadoReportes = await consultarReportes()
    if (listadoReportes.msg) {
        return res.json(solicitudes[0])
    }
    listadoReportes.forEach(element => {
        element.fechareporte = element.fechareporte.toLocaleDateString('es-CO')
    })
    res.json(listadoReportes)
}

const consultarReporte = async (req, res) => {
    const id = req.body.id
    const reporte = await consultarReporteUno(id)
    if (reporte.msg) {
        return res.json(reporte)
    }

    // normalizamos las fecha a la  hora local del pc
    reporte.fechareporte.setMinutes(reporte.fechareporte.getMinutes() + reporte.fechareporte.getTimezoneOffset())
    reporte.fechareporte = reporte.fechareporte.toLocaleDateString('es-CO')
    reporte.fechaCreacion = reporte.fechaCreacion.toLocaleString('es-CO')
    reporte.fechaCierre = reporte.fechaCierre.toLocaleString('es-CO')

    if (reporte.proximoMtto !== null) {
        reporte.proximoMtto.setMinutes(reporte.proximoMtto.getMinutes() + reporte.proximoMtto.getTimezoneOffset())
        reporte.proximoMtto = reporte.proximoMtto.toLocaleDateString('es-CO')
    }

    // rcuerda crear el buffer de imagenes 
    if (reporte.img_reporte !== null && reporte.img_reporte !== '') {
        reporte.img_reporte = reporte.img_reporte.split(',')
        reporte.img_reporte = bufferimagenes(reporte.img_reporte, reporte, 2)
    } else {
        reporte.img_reporte = ''
    }

    reporte.pdfReporte = await crearPdfMake(id, 'Reporte')

    res.json({
        reporte
    })


}

const crearReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos, Id_proveedores } = req

    const arrPermisos = JSON.parse(permisos)
    const proveedores = JSON.parse(Id_proveedores)

    if (arrPermisos.indexOf(6) === -1) return res.json({ msg: 'Usted no tiene permisos para crear crear reportes de mantenimiento' })

    const data = req.body.datos

    const idSolicitud = data.idSolicitud.split('-')[1]
    if (idSolicitud !== data.solicitud.split('-')[1]) return res.json({ msg: 'La solicitud no pudo verificarse para crear el reporte' })

    // validar que la solicitud exista y que no este cerrada o eliminada

    const dataSolicitud = await consultaValidarSolicitudReporte(idSolicitud)
    if (dataSolicitud.msg) return res.json(dataSolicitud)

    if (dataSolicitud.idReporte != null) {
        return res.json({ msg: 'la solicitud ya tiene un reporte creado' })
    }

    if (dataSolicitud.estadoSolicitud == 3) {
        return res.json({ msg: 'la solicitud esta en estado cerrada y no puede modificarse' })
    }

    if (dataSolicitud.estadoSolicitud == 4) {
        return res.json({ msg: 'la solicitu no existe o fue eliminada' })
    }
    // validamos que todos los datos sean correctos para ingresarlos a la bd
    const validarDatos = await validarDatoReporte(data)
    if (validarDatos.msg) return res.json(validarDatos)

    if (dataSolicitud.codigo !== data.codigo) return res.json({ msg: 'La solicitud no corresponde al activo selecionado' })

    data.id_activo = dataSolicitud.id_activo

    data.provedorMttoId = parseInt(data.provedorMttoId.split('-')[1])
    if (proveedores.indexOf(data.provedorMttoId) === -1) return res.json({ msg: 'Usted no esta asociado al proveedor de mantenimientos seleccionado, favor seleccione uno al cual este asociado.' })

    const fechaSolicitud = dataSolicitud.fecha_solicitud.toISOString().substring(0, 10)

    if (fechaSolicitud > data.fechareporte) return res.json({ msg: 'La fecha de realizacion del mantenimiento no puede ser inferior a la fecha de solicitud' })
    //validar las imagenes  

    let imagenes = null
    if (data.imagenes.length > 0) {
        for (let imagen of data.imagenes) {
            const validacionImagen = validarImagenes(imagen)
            if (validacionImagen.msg) return res.json(validacionImagen)
        }
        imagenes = data.imagenes
        delete data.imagenes
    }

    if (data.soportePDF != null) {
        const validarDocumento = validarDocumentos(data.soportePDF)
        if (validarDocumento.msg) return res.json(validarDocumento)
    }

    data.usuario_idReporte = sessionid
    data.fechaCreacion = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
    data.estadoSolicitudId = data.estadoSolicitudId.split('-')[1]
    if (data.estadoSolicitudId == 3) data.fechaCierre = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')

    // depuramos el objeto data para normalizar los datos que se ingresaran a la bd    

    delete data.estadoActivo
    delete data.tipoMantenimiento
    delete data.provedorMtto
    delete data.recibidoConforme
    delete data.estadoSolicitud
    delete data.codigo
    delete data.solicitud

    data.estadoActivoId = data.estadoActivoId.split('-')[1]
    data.recibidoConformeId = data.recibidoConformeId.split('-')[1]
    data.tipoMantenimientoId = data.tipoMantenimientoId.split('-')[1]
    data.idSolicitud = idSolicitud

    // guardamos los datos del reporte en la base de  datos
    const guardado = await guardarReporte(data)
    if (guardado.msg) return res.json(guardado)
    // consulta los datos del activo
    const dataBd = await consultarCodigoInterno(dataSolicitud.id_activo)
    if (dataBd.msg) return res.json({ msg: ' no fue posible terminar de guardar los datos del reporte verifique los datos guardados y actualicelos' })

    // guardamos las imagenes en la carpeta del reporte del activo y actualizamos los nombres en la base de datos
    dataBd.idReporte = guardado

    if (imagenes !== null) {
        const nombreImagenes = []
        for (const imagen of imagenes) {
            const guardarImagen = await guardarImagenesBase64(imagen, dataBd, 2);
            if (!guardarImagen.msg) nombreImagenes.push(guardarImagen);
        }
        // guardar imagenes y actualizar en la base de datos.

        if (nombreImagenes.length > 0) {
            const datos = {
                id: guardado,
                img_reporte: nombreImagenes.toString()
            }
            const guardadoImagenes = await actualizarImagenesReporte(datos)
            if (guardadoImagenes.msg) return res.json({ msg: 'no fue posible guardar las imagenes en la base de datos verifique los datos guardados y actualicelos', reporte: guardado })
            data.img_reporte = nombreImagenes
        }
    }

    // actualizamos el estado y la fecha del proximo mtto del equipo en listado activo
    const dataActivo = {
        id: dataSolicitud.id_activo,
        estadoActivoId: data.estadoActivoId,
        fechaproximoMtto: data.fechaproximoMtto
    }
    const actualizacion = await actualizarEstadoyFechaActivo(dataActivo)
    if (actualizacion.msg) return res.json({ msg: 'No fuen posible actualizar el estado del activo favor verifique y actualicelos', reporte: guardado })

    // guardamos el pdf de soporte externo en la cartpeta del activo 

    if (data.soportePDF != null) {
        const datos = {
            file: data.soportePDF,
            documento: 'Rep',
            idReporte: guardado
        }
        const guardarDocumento = guardarDocumentoBase64(datos, dataBd, 2)
        if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf, favor verifique y actualice el reporte.', reporte: guardado })
    } else {
        const pdfmake = await crearPdfMake(guardado, 'Reporte');

        const datos = {
            file: 'data:application/pdf;base64,'+ pdfmake,
            documento: 'Rep',
            idReporte: guardado
        }

        const guardarDocumento = await guardarDocumentoBase64(datos, dataBd, 2)
  
        if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf make, favor verifique y actualice el reporte.', reporte: guardado })
    }

    res.json({
        reporte: guardado
    })


}

const modificarReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos, Id_proveedores } = req

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });


    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        const data = JSON.parse(fields.data)

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataSolicitud = await consultarSolicitudUno(data.solicitud_id)

        // valida que la solictud del reporte  no este cerrada
        if (dataSolicitud.id_estado === 3) {
            return res.json({ msg: 'La solicitud de mantenimiento ya ha sido gestionada, no se puede modificar el reporte' })
        }
        // consulta los datos del reporte y verifica que exista un reporte de la solicitud del activo
        const dataReporte = await consultarReporteUno(data.id)
        if (typeof dataReporte === 'undefined') {
            return res.json({ msg: 'La solicitud no existe' })
        }

        // verifica los permisos para modificar un reporte
        if (dataReporte.usuario_idReporte !== sessionid) {
            const arrPermisos = JSON.parse(permisos)
            if (arrPermisos.indexOf(7) === -1) {
                return res.json({ msg: 'Usted no tiene permisos para modificar solicitudes' })
            } else {
                return res.json({ msg: 'Esta solicitud Fue radicada por otro usuario.' })
            }
        }
        // verifica que el reporte perteneca al activo 

        if (dataReporte.id_activo !== data.id_activo) {
            return res.json({ msg: 'El activo no corresponde al ID del reporte que intenta modificar' })
        }

        // normalizar las fechas compararlas y normalizar para enviar a la bd
        const fechaSolicitud = dataSolicitud.fecha_solicitud.toLocaleDateString('es-CO')
        //verifica que la fecha del reporte no sea menor que la fecha de solciitud 
        if (fechaSolicitud > data.fechareporte) {
            res.json({ msg: 'La fecha de realizacion del mantenimiento no puede ser inferior a la fecha de solicitud' })
            return
        }
        // valida todos los datos enviados por el susuario 
        const validarDatos = validarDatoReporte(data)

        if (validarDatos.msg) {
            return res.json(validarDatos)
        }

        // verifica si se modifico algun elemento de las imagenes 
        let imageneDb = dataReporte.img_reporte.split(',')
        const ElminoImagen = JSON.stringify(imageneDb) === JSON.stringify(data.img_solicitud)

        let imagenesEliminar

        // devuelve un aray de las imagenes a eliminar
        if (!ElminoImagen) {
            imagenesEliminar = imageneDb.filter(image => !data.img_reporte.includes(image))
        }
        // conssulta los datos del activo 
        const dataActivo = await consultarCodigoInterno(data.id_activo)
        let errores = {}
        // guarda las nuevas imagenes 
        if (files.Image) {
            const nuevaUrl_imag = await guardarImagenesNuevoActivo(files, dataActivo, 2)
            if (nuevaUrl_imag.msg) {
                errores.url_img = nuevaUrl_imag
            }
            const nuevasImages = nuevaUrl_imag.concat(data.img_reporte)
            data.img_reporte = nuevasImages
        }
        // elimina las imagenes
        if (!ElminoImagen) {
            await eliminarImagenes(imagenesEliminar, dataActivo, 2)
        }
        // actualiza los datos de las imagenes y fecha de cierre del formato
        data.img_reporte = data.img_reporte.toString()
        data.fechaCierre = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
        // actualiza los datos del reporte en la base de datos.
        const actualizar = await actualizarReporte(data)
        if (actualizar.msg) {
            return res.json(actualizar)
        }

        // covierte los nombre de las imagenes de string a array para devolverlo al frontend
        data.img_reporte = data.img_reporte.split(',')

        // valida que el estado es 3 y deja cargar un reporte externo
        if (data.id_estado === 3) {
            if (files.ReporteExterno) {
                const reporte = await guardarPDF(files.ReporteExterno, dataActivo, data.id)
                if (reporte.msg) {
                    errores.reportes = reporte.msg
                } else {
                    //crea un buffer del reporte externo y lo envia al usuario
                    data.pdfReporte = bufferReporte(dataActivo, data.id)
                }
            } else {
                //crear un buffer de los datos del soporte guardarlo en la carpeta del a activo y devolverlos al usuario
                data.pdfReporte = await crearPdfMake(data.id, 'Reporte')
                const guardarReporte = await guadarReporteFinal(data.pdfReporte, dataActivo, data.id)
                if (guardarReporte === 0) errores.guardarpdf = 'no fue posible crear el pdf del reporte'

            }
        } else {
            // en caso que no sea estado 3 crea un reporte con estado abierto
            data.pdfReporte = await crearPdfMake(data.id, 'Reporte')
        }
        // crea el buffer de las imagenes que se mostrar al usuario 
        data.Imagenes = bufferimagenes(data.img_reporte, dataActivo, 2)
        delete data.fechaCierre

        // enviar respuesta con los datos del activo e imagenes
        res.json({
            msg: 'El reporte se a actualizado correctamente',
            data,
            errores
        })
    });
}

const descargarListaMtto = async (req, res) => {

    // extrae los datos del req 
    const data = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })

    const listaMtto = await crearPdfMake(data.id, 'listadoReportes')

    res.json({
        listaMtto: `data:application/pdf;base64,${listaMtto}`,
        nombre: dataBd.codigo + ' - listaMtto'
    })
}

const consultarListasCofigReporte = async (req, res) => {
    const listadoConfReporte = await dataConfReporte()
    res.json(listadoConfReporte)
}

export {
    consultarReportesTodos,
    consultarReporte,
    crearReporte,
    modificarReporte,
    descargarListaMtto,
    consultarListasCofigReporte
}