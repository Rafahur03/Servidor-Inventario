import formidable from "formidable"
import { validarDatoReporte, validarDatosReportePrev } from "../helpers/validarDatosReporte.js"
// validar cambio de funcion import { validarFiles } from "../helpers/validarFiles.js"
import { consultarCodigoInterno, actualizarEstadoyFechaActivo } from "../db/sqlActivos.js"
import { consultaValidarSolicitudReporte } from "../db/sqlSolicitudes.js"
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
    bufferSoportepdf,
    eliminarReporteExterno,
    eliminarImagenesSoliRepor,
    guadarReporteEliminadoBd
} from "../helpers/copiarCarpetasArchivos.js"
import { listaNuevoReporte } from "../db/sqlConfig.js"

import {
    consultarReportes,
    consultarReporteUno,
    guardarReporte,
    actualizarReporte,
    dataConfReporte,
    actualizarImagenesReporte,
    actualizarSoporteReporte,
    consultarReportevalidacion,
    eliminarReporteBd,
    crearReportePrev

} from "../db/sqlReportes.js"


const consultarReportesTodos = async (req, res) => {
    const listadoReportes = await consultarReportes()
    if (listadoReportes.msg) {
        return res.json(solicitudes[0])
    }
    listadoReportes.forEach(element => {
        element.fechareporte = element.fechareporte.toISOString().substring(0, 10)
    })
    res.json(listadoReportes)
}

const consultarReporte = async (req, res) => {
    const id = parseInt(req.body.id)
    
    if (id == NaN) return res.json({ msg: 'Debe ingresar un id valido' })
    const { sessionid } = req
    const reporte = await consultarReporteUno(id)
    if (reporte.msg) return res.json(reporte)
    const dataBd = await consultarCodigoInterno(reporte.idActivo)
    if (dataBd.msg) return res.json(dataBd)
  
    // normalizamos las fecha a la  hora local del pc
    reporte.fechaReporte = reporte.fechaReporte.toISOString().substring(0, 10)
    if( reporte.proximoMtto !== null) reporte.proximoMtto = reporte.proximoMtto.toISOString().substring(0, 10)
    reporte.fechaSolicitud = reporte.fechaSolicitud.toISOString().substring(0, 10)
    reporte.imgActivo = reporte.imgActivo.split(',')
    // cargamos la imagenes 
    reporte.imagenesActivo = await bufferimagenes(reporte.imgActivo, dataBd)

    // rcuerda crear el buffer de imagenes 
    if (reporte.imgReporte !== null && reporte.imgReporte !== '') {
        reporte.imgReporte = reporte.imgReporte.split(',')
        dataBd.idReporte = reporte.idReporte
        reporte.imagenesReporte = await bufferimagenes(reporte.imgReporte, dataBd, 2)
    } else {
        reporte.imgReporte = null
    }
 
    if (reporte.repIntExte === 'Ext') {
        reporte.soporte = await bufferSoportepdf('Rep', dataBd, reporte.idReporte)
    }
 
    if (reporte.usuarioReporteId == sessionid) {
        if (reporte.estadoSolicitudId != 3 && reporte.estadoSolicitudId != 4) reporte.editar = true

    }

    if (sessionid == 1) {
        reporte.editar = true
        reporte.edOt = true
    }

    const listado = await listaNuevoReporte()
    if(listado.msg) return (res.json({msg: ' No se fue posible consultar todos los datos del reporte'}))
    reporte.listados = listado
    


    res.json(
        reporte
    )


}

const crearReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos, Id_proveedores } = req
    console.log(sessionid)

    if (permisos.indexOf(6) === -1) return res.json({ msg: 'Usted no tiene permisos para crear crear reportes de mantenimiento' })

    const data = req.body.datos

    const idSolicitud = data.idSolicitud.split('-')[1]
    if (idSolicitud !== data.solicitud.split('-')[1]) return res.json({ msg: 'La solicitud no pudo verificarse para crear el reporte' })

    // validar que la solicitud exista y que no este cerrada o eliminada

    const dataSolicitud = await consultaValidarSolicitudReporte(idSolicitud)
    if (dataSolicitud.msg) return res.json(dataSolicitud)

    if (dataSolicitud.idReporte != null) return res.json({ msg: 'la solicitud ya tiene un reporte creado' })

    if (dataSolicitud.estadoSolicitud == 3)  return res.json({ msg: 'la solicitud esta en estado cerrada y no puede modificarse' })

    if (dataSolicitud.estadoSolicitud == 4)return res.json({ msg: 'la solicitu no existe o fue eliminada' })
    
    // validamos que todos los datos sean correctos para ingresarlos a la bd
    const validarDatos = await validarDatoReporte(data)
    if (validarDatos.msg) return res.json(validarDatos)

    if (dataSolicitud.codigo !== data.codigo) return res.json({ msg: 'La solicitud no corresponde al activo selecionado' })

    data.id_activo = dataSolicitud.id_activo

    data.provedorMttoId = parseInt(data.provedorMttoId.split('-')[1])
    if (Id_proveedores.indexOf(data.provedorMttoId) === -1) return res.json({ msg: 'Usted no esta asociado al proveedor de mantenimientos seleccionado, favor seleccione uno al cual este asociado.' })

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
    console.log(data)
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
        const datosreporte = {
            id: guardado,
            repIntExte: 'Ext'
        }
        const actualizarReporteBd = await actualizarSoporteReporte(datosreporte)
        if (actualizarReporteBd.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf en la Base de datos verifique y actualice el reporte', reporte: guardado })
    } else {
        const pdfmake = await crearPdfMake(guardado, 'Reporte');

        const datos = {
            file: 'data:application/pdf;base64,' + pdfmake,
            documento: 'Rep',
            idReporte: guardado
        }

        const guardarDocumento = await guardarDocumentoBase64(datos, dataBd, 2)
        if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf make, favor verifique y actualice el reporte.', reporte: guardado })
        const datosreporte = {
            id: guardado,
            repIntExte: 'Int'
        }
        const actualizarReporteBd = await actualizarSoporteReporte(datosreporte)
        if (actualizarReporteBd.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf Make en la Base de datos verifique y actualice el reporte', reporte: guardado })
    }

    res.json({
        reporte: guardado,
        exito: 'Reporte Guardado correctamente'
    })


}

const guardarReportePrev = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos, Id_proveedores } = req

    if (permisos.indexOf(6) === -1) return res.json({ msg: 'Usted no tiene permisos para crear crear reportes de mantenimiento' })

    const data = req.body.datos

    const activo = data.activo.split('-')[1]
    if (activo !== data.idActivo.split('-')[1]) return res.json({ msg: 'el activo no pudo verificarse para crear el reporte' })

    // validar que la solicitud exista y que no este cerrada o eliminada

    const dataBd = await consultarCodigoInterno(activo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible validar los datos del activo' })

    if (dataBd.codigo !== data.codigo) return res.json({ msg: 'los datos del activo no correspondel al ID del actico' })

    // validamos que todos los datos sean correctos para ingresarlos a la bd
    const validarDatos = await validarDatosReportePrev(data)
    if (validarDatos.msg) return res.json(validarDatos)

    data.provedorMttoId = parseInt(data.provedorMttoId.split('-')[1])
    if (Id_proveedores.indexOf(data.provedorMttoId) === -1) return res.json({ msg: 'Usted no esta asociado al proveedor de mantenimientos seleccionado, favor seleccione uno al cual este asociado.' })

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

    const estadoActivoId = data.estadoActivoId.split('-')[1]
    const estadoSolicitudId = data.estadoSolicitudId.split('-')[1]
    const recibidoConformeId = data.recibidoConformeId.split('-')[1]

    
    const datosReporte = {
        id_activo: activo,
        id_usuario: recibidoConformeId,
        id_estado: estadoSolicitudId,
        fecha_solicitud: data.fechaSolicitud,
        solicitud: 'Mantenimeinto Preventivo Act-' + activo,
        tipoMantenimientoId: 1,
        fechaReporte: data.fechaReporte,
        costoMo: data.costoMo,
        costoMp: data.costoMp,
        provedorMttoId: data.provedorMttoId,
        usuario_idReporte: sessionid,
        recibidoConformeId,
        hallazgos: data.hallazgos,
        reporte: data.reporte,
        recomendaciones: data.recomendaciones,
        fechaCreacion: new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ') ,
        fechaproximoMtto:data.fechaproximoMtto,
        estadoActivoId
    }

    if (estadoSolicitudId == 3) datosReporte.fechaCierre = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')

    const guardado = await crearReportePrev(datosReporte)
    if (guardado.msg) {
        return res.json('no fue posible crear el reporte.')
    }

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

    // guardamos el pdf de soporte externo en la cartpeta del activo 

    if (data.soportePDF != null) {
        const datos = {
            file: data.soportePDF,
            documento: 'Rep',
            idReporte: guardado
        }
        const guardarDocumento = guardarDocumentoBase64(datos, dataBd, 2)
        if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf, favor verifique y actualice el reporte.', reporte: guardado })
        const datosreporte = {
            id: guardado,
            repIntExte: 'Ext'
        }
        const actualizarReporteBd = await actualizarSoporteReporte(datosreporte)
        if (actualizarReporteBd.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf en la Base de datos verifique y actualice el reporte', reporte: guardado })
    
    } else {
        const pdfmake = await crearPdfMake(guardado, 'Reporte');

        const datos = {
            file: 'data:application/pdf;base64,' + pdfmake,
            documento: 'Rep',
            idReporte: guardado
        }

        const guardarDocumento = await guardarDocumentoBase64(datos, dataBd, 2)
        if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf make, favor verifique y actualice el reporte.', reporte: guardado })
        const datosreporte = {
            id: guardado,
            repIntExte: 'Int'
        }
        
        const actualizarReporteBd = await actualizarSoporteReporte(datosreporte)
        if (actualizarReporteBd.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf Make en la Base de datos verifique y actualice el reporte', reporte: guardado })
    }

    res.json({
        reporte: guardado
    })

}

const modificarReporte = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, Id_proveedores } = req

    const data = req.body.datos
    const reporte = data.reporteId.split('-')[1]
    const activo = data.codigo.split('-')[1]
    const solicitud = data.idSolicitud.split('-')[1]

    if (isNaN(parseInt(reporte)) || isNaN(parseInt(activo)) || isNaN(parseInt(solicitud))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    if (reporteBd.estadoSolicitudId == 3 && reporteBd.estadoSolicitudId == 4) return res.json({ msg: 'la solicitud ya fue gestionada cerrada o eliminada por lo que no se puede eliminar la imagen' })

    if (sessionid !== 1) if (reporteBd.usuarioReporteId !== sessionid) return res.json({ msg: 'Usted no tiene permiso para modificar este reporte' })

    if (activo != reporteBd.idActivo || solicitud != reporteBd.idSolicitud) return res.json({ msg: ' error de validacion, Los datos no corresponden al reporte.' })


    // validamos que todos los datos sean correctos para ingresarlos a la bd
    const validarDatos = await validarDatoReporte(data)
    if (validarDatos.msg) return res.json(validarDatos)

    data.provedorMttoId = parseInt(data.provedorMttoId.split('-')[1])
    if (sessionid != 1) if (Id_proveedores.indexOf(data.provedorMttoId) === -1) return res.json({ msg: 'Usted no esta asociado al proveedor de mantenimientos seleccionado, favor seleccione uno al cual este asociado.' })

    const fechaSolicitud = reporteBd.fechaSolicitud.toISOString().substring(0, 10)

    if (fechaSolicitud > data.fechaReporte) return res.json({ msg: 'La fecha de realizacion del mantenimiento no puede ser inferior a la fecha de solicitud' })
    if (data.fechaReporte > data.fechaproximoMtto) return res.json({ msg: 'La fecha del proximo  mantenimiento no puede ser inferior a la fecha del reporte.' })

    data.usuario_idReporte = data.realizoReporteId.split('-')[1]
    data.estadoSolicitudId = data.estadoSolicitudId.split('-')[1]
    if (data.estadoSolicitudId == 3) data.fechaCierre = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')

    // depuramos el objeto data para normalizar los datos que se ingresaran a la bd    
    delete data.realizoReporteId
    delete data.estadoActivo
    delete data.tipoMantenimiento
    delete data.provedorMtto
    delete data.recibidoConforme
    delete data.estadoSolicitud
    delete data.codigo
    delete data.solicitud
    delete data.reporteId

    data.estadoActivoId = data.estadoActivoId.split('-')[1]
    data.recibidoConformeId = data.recibidoConformeId.split('-')[1]
    data.tipoMantenimientoId = data.tipoMantenimientoId.split('-')[1]
    data.idSolicitud = solicitud
    data.idActivo = reporteBd.idActivo
    data.idReporte = reporteBd.idReporte

    // actualzamos los daos en la bd

    const guardado = await actualizarReporte(data)
    if (guardado.msg) return res.json(guardado)

    const dataBd = await consultarCodigoInterno(data.idActivo)
    if (dataBd.msg) return res.json({ msg: ' no fue posible terminar de guardar los datos del reporte verifique los datos guardados y actualicelos' })

    // guardamos las imagenes en la carpeta del reporte del activo y actualizamos los nombres en la base de datos
    dataBd.idReporte = data.idReporte

    if (reporteBd.repIntExte == 'Int') {
        const pdfmake = await crearPdfMake(data.idReporte, 'Reporte');

        const datos = {
            file: 'data:application/pdf;base64,' + pdfmake,
            documento: 'Rep',
            idReporte: data.idReporte
        }

        const guardarDocumento = await guardarDocumentoBase64(datos, dataBd, 2)
        if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf make, favor verifique y actualice el reporte.', reporte: guardado })
    }

    res.json({
        idReporte: reporteBd.idReporte,
        exito: 'Reporte modificado exitosamente'
    })
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

const eliminarImagenReporte = async (req, res) => {

    const { sessionid } = req

    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const activo = datos.codigo.split('-')[1]
    const solicitud = datos.idSolicitud

    if (isNaN(parseInt(reporte)) || isNaN(parseInt(activo)) || isNaN(parseInt(solicitud))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    if (reporteBd.estadoSolicitudId == 3 && reporteBd.estadoSolicitudId == 4) return res.json({ msg: 'la solicitud ya fue gestionada cerrada o eliminada por lo que no se puede eliminar la imagen' })

    if (sessionid !== 1) if (reporteBd.usuarioReporteId !== sessionid) return res.json({ msg: 'Usted no tiene permiso para modificar este reporte' })

    if (activo != reporteBd.idActivo || solicitud != reporteBd.idSolicitud) return res.json({ msg: ' error de validacion, Los datos no corresponden al reporte.' })

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })

    reporteBd.imgReporte = reporteBd.imgReporte.split(',')

    if (!reporteBd.imgReporte.includes(datos.imagen)) return res.json({ msg: 'Imagen errada, actualice la pagina' })
    dataBd.idReporte = reporteBd.idReporte

    const eliminada = await eliminarImagenesSoliRepor(datos.imagen, dataBd, 2)
    if (eliminada.msg) return res.json({ msg: 'No fue posible eliminar la imagen del directorio' })
    const nuevaimagenes = reporteBd.imgReporte.filter((nombre) => nombre !== datos.imagen)


    const data = {
        id: reporteBd.idReporte,
        img_reporte: nuevaimagenes.toString()
    }
    const guardadoImagenes = await actualizarImagenesReporte(data)
    if (guardadoImagenes.msg) return res.json({ msg: 'No fue posible eliminar la imagen del la base de datos' })


    res.json({ exito: 'imagen eliminada correctamente' })
}

const eliminarSoporteExtReporte = async (req, res) => {
    const { sessionid } = req
    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const activo = datos.codigo.split('-')[1]
    const solicitud = datos.idSolicitud

    if (isNaN(parseInt(reporte)) || isNaN(parseInt(activo)) || isNaN(parseInt(solicitud))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    if (reporteBd.estadoSolicitudId == 3 && reporteBd.estadoSolicitudId == 4) return res.json({ msg: 'la solicitud ya fue gestionada cerrada o eliminada por lo que no se puede eliminar la imagen' })

    if (sessionid !== 1) if (reporteBd.usuarioReporteId !== sessionid) return res.json({ msg: 'Usted no tiene permiso para modificar este reporte' })

    if (activo != reporteBd.idActivo || solicitud != reporteBd.idSolicitud) return res.json({ msg: ' error de validacion, Los datos no corresponden al reporte.' })

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })

    dataBd.reporte = reporteBd.idReporte
    // eliminar reporte
    const eliminarReporte = await eliminarReporteExterno(dataBd)
    if (eliminarReporte.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })

    const actualizarBd = await actualizarSoporteReporte({ repIntExte: 'Int', id: reporteBd.idReporte })
    if (actualizarBd.msg) return res.json({ msg: 'El archivo fue eliminado pero no se pudo actualizar en la base de datos' })

    const pdfmake = await crearPdfMake(reporteBd.idReporte, 'Reporte');

    const data = {
        file: 'data:application/pdf;base64,' + pdfmake,
        documento: 'Rep',
        idReporte: reporteBd.idReporte
    }

    const guardarDocumento = await guardarDocumentoBase64(data, dataBd, 2)
    if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf make, favor verifique y actualice el reporte.', reporte: guardado })



    res.json({ exito: 'El documento se elimino y actualizo correctamente' })
}

const guardarImagenReporte = async (req, res) => {
    const { sessionid } = req
    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const activo = datos.codigo.split('-')[1]
    const solicitud = datos.idSolicitud

    if (isNaN(parseInt(reporte)) || isNaN(parseInt(activo)) || isNaN(parseInt(solicitud))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    if (reporteBd.estadoSolicitudId == 3 && reporteBd.estadoSolicitudId == 4) return res.json({ msg: 'la solicitud ya fue gestionada cerrada o eliminada por lo que no se puede eliminar la imagen' })

    if (sessionid !== 1) if (reporteBd.usuarioReporteId !== sessionid) return res.json({ msg: 'Usted no tiene permiso para modificar este reporte' })


    if (activo != reporteBd.idActivo || solicitud != reporteBd.idSolicitud) return res.json({ msg: ' error de validacion, Los datos no corresponden al reporte.' })

    const validacionImagen = validarImagenes(datos.imagen)
    if (validacionImagen.msg) return res.json(validacionImagen)

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })

    reporteBd.imgReporte = reporteBd.imgReporte.split(',')
    if (reporteBd.imgReporte.lengt >= 4) return res.json({ msg: 'No es posible guardar la imagen el reporte tiene el maximo de imagenes permitida' })

    dataBd.idReporte = reporteBd.idReporte
    const guardarImagen = await guardarImagenesBase64(datos.imagen, dataBd, 2);
    if (guardarImagen.msg) return res.json({ msg: 'No fue posible guardar la imagen en el directorio' })

    if (reporteBd.imgReporte[0] === '') reporteBd.imgReporte.shift()
    reporteBd.imgReporte.push(guardarImagen);

    const data = {
        id: reporteBd.idReporte,
        img_reporte: reporteBd.imgReporte.toString()
    }


    const guardadoImagenes = await actualizarImagenesReporte(data)
    if (guardadoImagenes.msg) return res.json({ msg: 'No fue posible guardar la imagen del la base de datos' })

    res.json({
        exito: 'Imagen guardada correctamente',
        nombre: guardarImagen
    })
}

const guardarSoporteExtReporte = async (req, res) => {

    const { sessionid } = req
    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const activo = datos.codigo.split('-')[1]
    const solicitud = datos.idSolicitud

    if (isNaN(parseInt(reporte)) || isNaN(parseInt(activo)) || isNaN(parseInt(solicitud))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    if (reporteBd.estadoSolicitudId == 3 && reporteBd.estadoSolicitudId == 4) return res.json({ msg: 'la solicitud ya fue gestionada cerrada o eliminada por lo que no se puede eliminar la imagen' })

    if (sessionid !== 1) if (reporteBd.usuarioReporteId !== sessionid) return res.json({ msg: 'Usted no tiene permiso para modificar este reporte' })


    if (activo != reporteBd.idActivo || solicitud != reporteBd.idSolicitud) return res.json({ msg: ' error de validacion, Los datos no corresponden al reporte.' })

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })

    dataBd.reporte = reporteBd.idReporte
    // eliminar reporte
    const data = {
        file: datos.soportePDF,
        documento: 'Rep',
        idReporte: reporteBd.idReporte
    }
    const guardarDocumento = await guardarDocumentoBase64(data, dataBd, 2)
    if (guardarDocumento.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf, favor verifique y actualice el reporte.', reporte: guardado })
    const datosreporte = {
        id: reporte,
        repIntExte: 'Ext'
    }
    const actualizarReporteBd = await actualizarSoporteReporte(datosreporte)
    if (actualizarReporteBd.msg) return res.json({ msg: 'No fue posible guardar el Soporte en pdf en la Base de datos verifique y actualice el reporte', reporte: guardado })

    const soporte = await bufferSoportepdf('Rep', dataBd, reporte.idReporte)

    res.json({
        exito: 'El documento se elimino y actualizo correctamente',
        soporte
    })
}

const eliminarReporte = async (req, res) => {
    const { sessionid } = req
    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const activo = datos.idActivo.split('-')[1]
    const solicitud = datos.idSolicitud

    if (isNaN(parseInt(reporte)) || isNaN(parseInt(activo)) || isNaN(parseInt(solicitud))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    if (reporteBd.estadoSolicitudId == 3 && reporteBd.estadoSolicitudId == 4) return res.json({ msg: 'EL reporte ya fue cerrado o eliminado.' })

    if (sessionid !== 1) if (reporteBd.usuarioReporteId !== sessionid) return res.json({ msg: 'Usted no tiene permiso eliminar este reporte' })

    if (activo != reporteBd.idActivo || solicitud != reporteBd.idSolicitud) return res.json({ msg: ' error de validacion, Los datos no corresponden al reporte.' })

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el reporte intentelo mas tarde' })

    dataBd.reporte = reporteBd.idReporte

    const eliminarReporte = await eliminarReporteExterno(dataBd)
    if (eliminarReporte.msg) return res.json({ msg: 'No fue posible eliminar el reporte intentalo más tarde' })

    const pdfmake = await crearPdfMake(reporteBd.idReporte, 'Reporte');
    const asegurarInfoBd = await guadarReporteEliminadoBd(pdfmake, dataBd)
    if (asegurarInfoBd.msg) return res.json({ msg: 'No fue posible el reporte intentelo más tarde' })

    const eliminar = await eliminarReporteBd(reporteBd.idReporte, reporteBd.idSolicitud)
    if (eliminar.msg) return res.json(eliminar.msg)

    res.json({ exito: 'reporte eliminado correctamente' })


}
const descargarReporte = async (req, res) => {

    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const idReporte = datos.idReporte
    if (isNaN(parseInt(reporte)) || isNaN(parseInt(idReporte))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    if (reporte != idReporte) return res.json({ msg: 'No se pudo comprar el Id del reporte' })
    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })
    dataBd.reporte = reporteBd.idReporte

    const pdfmake = await crearPdfMake(reporteBd.idReporte, 'Reporte')

    res.json({
        reportePDF: 'data:application/pdf;base64,' + pdfmake,
        nombre: 'Rep-Int-' + dataBd.codigo + '-' + dataBd.reporte,
    })

}

const descargarReporteExterno = async (req, res) => {
    const { datos } = req.body
    const reporte = datos.reporte.split('-')[1]
    const idReporte = datos.idReporte
    if (isNaN(parseInt(reporte)) || isNaN(parseInt(idReporte))) return res.json({ msg: 'Debe seleccionar un reporte valido' })

    if (reporte != idReporte) return res.json({ msg: 'No se pudo comprar el Id del reporte' })
    const reporteBd = await consultarReportevalidacion(reporte)
    if (reporteBd.msg) return reporteBd.msg

    const dataBd = await consultarCodigoInterno(reporteBd.idActivo)
    if (dataBd.msg) return res.json({ msg: 'No fue posible eliminar el archivo intentalo más tarde' })
    dataBd.reporte = reporteBd.idReporte

    const reportePDF = await bufferSoportepdf('Rep', dataBd, reporteBd.idReporte)
    dataBd.reporte
    res.json({
        reportePDF,
        nombre: 'Rep-Ext-' + dataBd.codigo + '-' + dataBd.reporte,
    })
}




export {
    consultarReportesTodos,
    consultarReporte,
    crearReporte,
    modificarReporte,
    descargarListaMtto,
    consultarListasCofigReporte,
    eliminarReporte,
    eliminarImagenReporte,
    eliminarSoporteExtReporte,
    guardarImagenReporte,
    guardarSoporteExtReporte,
    descargarReporteExterno,
    descargarReporte,
    guardarReportePrev
}