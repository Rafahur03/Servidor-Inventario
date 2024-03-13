import formidable from "formidable"
import { validarDatoSolicitud } from "../helpers/validarDatosSolicitud.js"
// verificar ubo cambios import { validarFiles } from "../helpers/validarFiles.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
import { crearPdfMake } from "../helpers/crearPdfMake.js"
import {
    bufferimagenes,
    eliminarImagenesSoliRepor,
    guardarImagenesBase64
} from "../helpers/copiarCarpetasArchivos.js"
import {
    consultarSolicitudes,
    guardarSolicitud,
    consultarSolicitudUno,
    actualizarSolicitud,
    eliminarSolicitudDb,
    actualizarImagenesSolicitud,
    consultarSolicitureporte
} from "../db/sqlSolicitudes.js"

import { listaNuevoReporte } from "../db/sqlConfig.js"
import { validarImagenes } from "../helpers/validarFiles.js"
import { consultaconfi } from "../db/sqlConfig.js"
import { validarFecha } from "../helpers/validarfechas.js"
import { enviarCorreo } from "../helpers/eviarEmail.js"

const consultarSolicitudTodos = async (req, res) => {

    const { data } = req.body


    // validamos las fechas
    if (data.fechaInicialSolicitud != '') {
        if (!validarFecha(data.fechaInicialSolicitud)) return res.json({ msg: 'La fecha de inicio no es valida' })
        const hoy = new Date()
        const inicio = new Date(data.fechaInicialSolicitud)
        if (inicio > hoy) return res.json({ msg: 'La fecha de inicio no puede ser mayor al dia de hoy' })
    }
    if (data.fechaFinalSolicitud != '') {
        if (!validarFecha(data.fechaFinalSolicitud)) return res.json({ msg: 'La fecha de Final no es valida' })
        const hoy = new Date()
        const fin = new Date(data.fechaFinalSolicitud)
        if (fin > hoy) return res.json({ msg: 'La fecha de final no puede ser mayor al dia de hoy' })
    }

    //establecemos la fechas de inicio y final
    let fechaInicio
    let fechaFin
    if (data.fechaInicialSolicitud == '' && data.fechaFinalSolicitud == '') {
        let fechaActual = new Date()
        fechaActual.setDate(fechaActual.getDate() + 1)
        fechaFin = fechaActual.toISOString().substring(0, 10)
        fechaActual = new Date()
        fechaActual.setMonth(fechaActual.getMonth() - 12)
        fechaInicio = fechaActual.toISOString().substring(0, 10)
    } else if (data.fechaInicialSolicitud == '') {
        fechaFin = data.fechaFinalSolicitud
        const fin = new Date(data.fechaFinalSolicitud)
        fin.setMonth(fin.getMonth() - 12)
        fechaInicio = fin.toISOString().substring(0, 10)
    } else if (data.fechaFinalSolicitud == '') {
        fechaInicio = data.fechaInicialSolicitud
        const inicio = new Date(data.fechaInicialSolicitud)
        inicio.setMonth(inicio.getMonth() + 12)
        fechaFin = inicio.toISOString().substring(0, 10)
    } else {
        const inicio = new Date(data.fechaInicialSolicitud)
        const fin = new Date(data.fechaFinalSolicitud)
        if (inicio > fin) return res.json({ msg: 'La fecha de inicio no puede ser mayor a la fecha final' })
        // Calcula la diferencia en meses
        const diferenciaEnMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth())
        if (diferenciaEnMeses > 12) return res.json({ msg: 'El rango de fechas supera los doce (12) meses' })

        fechaInicio = data.fechaInicialSolicitud
        fin.setDate(fin.getDate() + 1)
        fechaFin = fin.toISOString().substring(0, 10)
    }


    for (var i = 0; i < data.filtros.length; i++) {
        if (typeof data.filtros[i].valor !== 'boolean') return res.json({ msg: 'No se pudo validar los filtros seleccionados' });

        if (typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
    }

    if (data.filtros.every(item => item.valor === false)) return res.json({ msg: 'Debe escoger una Clasificacion de Activo' })

    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')
    if (clasificacion.msg) return res.json({ msg: 'No fue posible validar la consulta' })
    //filtramos las siglas que tengan valor true
    const filtrosSiglas = data.filtros.filter(element => element.valor)
    // validamos que los filtros con valor true correspondan a una clasificacon activo valida
    const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
    if (filtros.length == 0) return res.json({ msg: 'Debe seleccionar un filtro valido' })


    let condicion = "WHERE (sm.id_estado <> 4 AND sm.fecha_solicitud >= '" + fechaInicio + "' AND sm.fecha_solicitud <= '" + fechaFin + "' AND("

    filtros.forEach((element, index) => {
        if (index === 0) {
            condicion = condicion + ' la.clasificacion_id = ' + element.id
        } else {
            condicion = condicion + ' OR la.clasificacion_id = ' + element.id
        }

    })

    condicion = condicion + ')) \nORDER BY sm.id_estado ASC, fecha_solicitud;'


    const solicitudes = await consultarSolicitudes(condicion)
    if (solicitudes.msg) return res.json({ msg: 'No fue posible consultar el listado de solicitudes' })
    if (solicitudes.length === 0) return res.json({ msg: 'La consulta bajo estos filtros no arrojo resultado modifiquelos e intente de nuevo' })

    solicitudes.forEach(element => { element.fecha_solicitud = element.fecha_solicitud.toISOString().substring(0, 10) });
    res.json(solicitudes)

}

const consultarSolicitud = async (req, res) => {
    const { sessionid, permisos } = req
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
        solicitud.imagenesSolicitud = imagenesSolicitud
    } else {
        solicitud.img_solicitud = null
    }

    solicitud.imagenes_Activo = solicitud.imagenes_Activo.split(',')
    const imagenesActivo = await bufferimagenes(solicitud.imagenes_Activo, dataBd)
    solicitud.imagenesActivo = imagenesActivo
    solicitud.fecha_solicitud = solicitud.fecha_solicitud.toISOString().substring(0, 10)

    solicitud.editar = false
    solicitud.reporte = false

    if (solicitud.idUsuario == sessionid) {
        solicitud.editar = true
    } else {
        if (permisos.indexOf(5) !== -1) solicitud.editar = true
    }

    if (solicitud.idReporte !== null) solicitud.editar = false
    if (permisos.indexOf(6) !== -1) solicitud.reporte = true
    res.json(
        solicitud
    )


}

const crearSolicitud = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, nombreUsuario } = req
    try {
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
        data.fecha_solicitud = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
        data.id_estado = 1
        delete data.idActivo
        delete data.descripcion

        const guardado = await guardarSolicitud(data)
        if (guardado.msg) return res.json(guardado)

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
                if (guardadoImagenes.msg) return res.json({ msg: 'no fue posible guardar las imagenes en la base de datos' })
            }
        }

        data.id = guardado
        if (data.img_solicitud) {
            const Imagenes = await bufferimagenes(data.img_solicitud, dataBd, 1) //
            return res.json({
                data,
                Imagenes
            })
        }

        res.json({
            id: guardado
        })

        const pdfSolicitud = await crearPdfMake(dataBd.id, 'Solicitud')
        const datos = {
            base64: pdfSolicitud,
            asunto: 'SE HA CREADO LA SOLICITUD NUMERO ' + guardado,
            mensaje: 'Los requerimientos de la solicitud son: \n \n' + data.solicitud + '\n \n creada por : ' + nombreUsuario,
            nombre: 'Sol-' + guardado + '.pdf'
        }

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Crea Solicitud ' + guardado, ipAddress)

        await enviarCorreo(datos)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al intentar guardar la solicitud, antes de itentar crearla nuevamente, valida que esta se ya este creada' })
        console.log('Ha ocurrido un error ' + error)

    }
}

const editarSolicitud = async (req, res) => {
    try {
        // validar permisos para crear activos
        const { sessionid, permisos } = req
        const data = req.body.datos
        const solicitud = data.solicitud.split('-')[1]
        if (solicitud != data.idSolicitud) return res.json({ msg: 'No se puede procesar la solicitud, Error en el ID de la solicitud' })

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarSolicitudUno(data.idSolicitud)
        if (dataBd === undefined) return { msg: 'No se contro la solictud que intenta modificar' }
        if (dataBd.msg) return { msg: 'No se pudo validar la informacion intente mas tarde' }
        if (data.idActivo === dataBd.id_activo) return res.json({ msg: 'La solicitud no corresponde al activo verifique la informacion' })

        if (dataBd.id_estado !== 1) return res.json({ msg: 'No se puede Actualizar la solictud, ya ha sido gestionada su estado es diferente de Abierto' })

        if (dataBd.idReporte !== null) return res.json({ msg: 'No se puede Actualizar la solictud, ya ha sido gestionada y tiene un reporte creado ' })

        if (dataBd.idUsuario !== sessionid) if (permisos.indexOf(5) === -1) return res.json({ msg: 'Usted no tiene permisos para editar solicitudes' })

        const validarDatos = validarDatoSolicitud(data)

        if (validarDatos.msg) return res.json(validarDatos)

        const actualizar = await actualizarSolicitud(data)
        if (actualizar.msg) return res.json(actualizar)


        res.json({
            exito: 'Activo actualizado correctamente'
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Edita Solicitud ' + dataBd.id, ipAddress)
    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al intentar editar la solicitud' })
        console.log('Ha ocurrido un error ' + error)


    }
}

const eliminarSolicitud = async (req, res) => {
    try {


        const { sessionid, permisos } = req
        const data = req.body.datos
        const solicitud = data.solicitud.split('-')[1]
        if (solicitud != data.idSolicitud) return res.json({ msg: 'No se puede procesar la solicitud, Error en el ID de la solicitud' })

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarSolicitudUno(data.idSolicitud)
        if (dataBd === undefined) return { msg: 'No se contro la solictud que intenta eliminar' }
        if (dataBd.msg) return { msg: 'No se pudo validar la informacion intente mas tarde' }
        if (data.idActivo === dataBd.id_activo) return res.json({ msg: 'La solicitud no corresponde al activo verifique la informacion' })

        if (dataBd.id_estado !== 1) return res.json({ msg: 'No se puede eliminar la solictud, ya ha sido gestionada su estado es diferente de Abierto' })

        if (dataBd.idReporte !== null) return res.json({ msg: 'No se puede eliminar la solictud, ya ha sido gestionada y tiene un reporte creado ' })

        if (dataBd.idUsuario !== sessionid) if (permisos.indexOf(5) === -1) return res.json({ msg: 'Usted no tiene permisos para editar solicitudes' })

        const actualizar = await eliminarSolicitudDb(dataBd.id)
        if (actualizar.msg) return res.json(actualizar)


        res.json({
            exito: 'Eliminado Correctamente',
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Elimino Solicitud ' + dataBd.id, ipAddress)
    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al intentar eliminar la solicitud' })
        console.log('Ha ocurrido un error ' + error)

    }
}


const eliminarImagenSolicitud = async (req, res) => {
    try {
        const { sessionid, permisos } = req
        const data = req.body.datos
        const solicitud = data.solicitud.split('-')[1]
        if (solicitud != data.idSolicitud) return res.json({ msg: 'No se puede procesar la solicitud, Error en el ID de la solicitud' })

        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarSolicitudUno(data.idSolicitud)
        if (dataBd === undefined) return { msg: 'No se contro la solictud que intenta modificar' }

        if (dataBd.msg) return { msg: 'No se pudo validar la informacion intente mas tarde' }
        if (data.idActivo === dataBd.id_activo) return res.json({ msg: 'La solicitud no corresponde al activo verifique la informacion' })

        if (dataBd.id_estado !== 1) return res.json({ msg: 'No se puede eliminar la Imagen, la solicitud ya ha sido gestionada su estado es diferente de Abierto' })

        if (dataBd.idReporte !== null) return res.json({ msg: 'No se puede eliminar la Imagen, la solicitud ya ha sido gestionada y tiene un reporte creado ' })

        if (dataBd.idUsuario !== sessionid) if (permisos.indexOf(5) === -1) return res.json({ msg: 'Usted no tiene permisos para editar solicitudes' })

        const imagenes = dataBd.img_solicitud.split(',')
        const imagen = data.imagen
        const nuevaImagen = imagenes.filter((item) => item !== imagen)
        if (imagenes.length == nuevaImagen.length) return res.json({ msg: 'No se encontro la imagen a eliminar' })

        const datos = {
            img_solicitud: nuevaImagen.toString(),
            id: dataBd.id
        }
        const actualizar = await actualizarImagenesSolicitud(datos)
        if (actualizar.msg) return res.json(actualizar)

        const dataActivo = await consultarCodigoInterno(dataBd.id_activo)
        dataActivo.idSolicitud = dataBd.id
        // elimina la imagen del bd
        const eliminada = await eliminarImagenesSoliRepor(imagen, dataActivo, 1)
        if (eliminada.msg) return res.json({ msg: 'No fue posible eliminar la imagen del directorio' })

        res.json({
            exito: 'Eliminado Correctamente',
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Elimino Imagen Solicitud' + dataBd.id + ' imagenes ' + nuevaImagen.toString(), ipAddress)
    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al intentar eliminar la Imagen de la solicitud' })
        console.log('eliminar la Imagen solicitud ' + error)

    }


}

const guardarImagenSolicitud = async (req, res) => {

    try {

        const { sessionid, permisos } = req
        const data = req.body.datos
        const solicitud = data.solicitud.split('-')[1]
        if (solicitud != data.idSolicitud) return res.json({ msg: 'No se puede procesar la solicitud, Error en el ID de la solicitud' })


        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarSolicitudUno(data.idSolicitud)

        if (dataBd.msg) return { msg: 'No se pudo validar la informacion intente mas tarde' }
        if (data.idActivo === dataBd.id_activo) return res.json({ msg: 'La solicitud no corresponde al activo verifique la informacion' })


        if (dataBd.id_estado !== 1) return res.json({ msg: 'No se puede cargar la Imagen, la solicitud ya ha sido gestionada su estado es diferente de Abierto' })


        if (dataBd.idReporte !== null) return res.json({ msg: 'No se puede cargar la Imagen, la solicitud ya ha sido gestionada y tiene un reporte creado ' })

        if (dataBd.idUsuario !== sessionid) {
            if (permisos.indexOf(5) === -1) {
                return res.json({ msg: 'Usted no tiene permisos para editar solicitudes' })
            }
        }

        const imagen = data.imagen
        const validacionImagen = validarImagenes(imagen)
        if (validacionImagen.msg) return res.json(validacionImagen)

        const imagenes = dataBd.img_solicitud.split(',')
        if (imagenes.length >= 4) return res.json({ msg: 'La solicitud tiene 4 imagenes, el maximo que se puede subir' })

        const dataActivo = await consultarCodigoInterno(dataBd.id_activo)
        dataActivo.idSolicitud = dataBd.id

        const guardarImagen = await guardarImagenesBase64(imagen, dataActivo, 1);
        if (guardarImagen.msg) return res.json(guardarImagen)


        if (imagenes[0] === '') imagenes.shift()
        imagenes.push(guardarImagen);

        const datos = {
            img_solicitud: imagenes.toString(),
            id: dataBd.id
        }
        const actualizar = await actualizarImagenesSolicitud(datos)
        if (actualizar.msg) {
            return res.json(actualizar)
        }

        res.json({
            nombre: guardarImagen
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Guardar Imagen Solicitud' + dataBd.id + ' imagenes ' + guardarImagen, ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al intentar Guardar la Imagen de la solicitud' })
        console.log('Guardar la Imagen solicitud ' + error)

    }
}

const descargarSolicitud = async (req, res) => {

    try {
        const { sessionid } = req
        // extrae los datos del req 
        const data = req.body.datos
        const solicitud = data.solicitud.split('-')[1]
        if (solicitud != data.idSolicitud) return res.json({ msg: 'No se puede procesar la solicitud, Error en el ID de la solicitud' })
        // VALIDAR QUE EL CODIGO PERTENESCA AL ACTIVO
        const dataBd = await consultarSolicitudUno(data.idSolicitud)

        if (dataBd.msg) return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })

        const pdfSolicitud = await crearPdfMake(dataBd.id, 'Solicitud')
        res.json({
            solicitud: `data:application/pdf;base64,${pdfSolicitud}`,
            nombre: `Solictud - Sol-${dataBd.id}`
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargo Solicitud' + dataBd.id, ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al intentar Guardar la Imagen de la solicitud' })
        console.log('Guardar la Imagen solicitud ' + error)

    }

}

const consultarSolicitudReporte = async (req, res) => {

    if (permisos.indexOf(6) === -1) return res.json({ msg: 'Usted no tiene permisos para crear reportes' })
    const id = req.body.id

    const solicitud = await consultarSolicitureporte(id)
    if (solicitud.msg) return res.json({ msg: 'Ha ocurido un error consultando los datos intentelo mas tarde' })
    if (solicitud.msg) return res.json(solicitud)

    const dataBd = await consultarCodigoInterno(solicitud.id_activo)
    if (dataBd.msg) return res.json({ msg: 'Ha ocurido un error consultando los datos intentelo mas tarde' })
    //valos por aqui
    solicitud.imagenes_Activo = solicitud.imagenes_Activo.split(',')
    const imagenesActivo = await bufferimagenes(solicitud.imagenes_Activo, dataBd)
    solicitud.imagenesActivo = imagenesActivo
    solicitud.fecha_solicitud = solicitud.fecha_solicitud.toISOString().substring(0, 10)
    const listado = await listaNuevoReporte()

    if (listado.msg) return res.json({ msg: 'Ha ocurido un error consultando los datos intentelo mas tarde' })
    solicitud.listados = listado

    res.json(
        solicitud
    )

}



export {
    consultarSolicitudTodos,
    crearSolicitud,
    editarSolicitud,
    eliminarSolicitud,
    consultarSolicitud,
    eliminarImagenSolicitud,
    guardarImagenSolicitud,
    descargarSolicitud,
    consultarSolicitudReporte
}