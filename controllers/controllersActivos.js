import formidable from "formidable"
import mime from 'mime-types'
import { validarDatosActivoOld } from "../helpers/validarDatosActivoOld.js"
import { validarDatosActivo } from "../helpers/validarDatosActivo.js"
import { validarImagenes, validarDocumentos } from "../helpers/validarFiles.js"
import { crearPdfMake } from "../helpers/crearPdfMake.js"
import { consultarReportesActivo } from "../db/sqlReportes.js"
import { validarDatosComponente } from "../helpers/validarComponentes.js"
import { crearComponente } from "../db/sqlComponentes.js"
import {
    copiarYCambiarNombre,
    guardarImagenesNuevoActivo,
    guardarImagenesBase64,
    bufferimagenes,
    bufferimagen,
    eliminarImagenes,
    eliminarCarpetaActivo,
    guardarPDF,
    bufferSoportespdf,
    elimnarSoportePdf,
    bufferSoportepdf,
    guardarDocumentoBase64
} from "../helpers/copiarCarpetasArchivos.js"

import {
    dataConfActivo,
    consultarActivos,
    consultarActivoUno,
    guardarNuevoActivo,
    guardarImagenes,
    consultarCodigoInterno,
    actualizarActivoDb,
    consultarCalsificacionActivoMod,
    actualizarClasificacion,
    eliminarActivoDb,
    guardarSoportes,
    consultarActivoReportePrev,
    actualizarSoportes,
    consultarActivoSolicitud
} from "../db/sqlActivos.js"

import { consultarComponentes } from "../db/sqlComponentes.js"



const consultarActivosTodos = async (req, res) => {
    const listadoActivos = await consultarActivos()
    res.json(listadoActivos)
}

const consultarListasConfActivos = async (req, res) => {
    const listadoConfActivos = await dataConfActivo()
    res.json(listadoConfActivos)
}

const consultarActivo = async (req, res) => {
    const id = req.body.id

    const activo = await consultarActivoUno(id)
    const componentes = await consultarComponentes(id)
    const reportes = await consultarReportesActivo(id)

    reportes.forEach(element => {
        if (element.proximoMtto != null) {
            element.proximoMtto = element.proximoMtto.toLocaleDateString('es-CO')
        }
        element.fechareporte = element.fechareporte.toLocaleDateString('es-CO')
    })

    activo.fecha_compra = activo.fecha_compra.toISOString().substring(0, 10)
    activo.vencimiento_garantia = activo.vencimiento_garantia.toISOString().substring(0, 10)
    activo.fecha_creacion = activo.fecha_creacion.toISOString().substring(0, 10)
    if (activo.fecha_proximo_mtto !== null) {
        activo.fecha_proximo_mtto = activo.fecha_proximo_mtto.toISOString().substring(0, 10)
    }

    if (activo.url_img !== null && activo.url_img.trim() !== '') {
        activo.url_img = activo.url_img.split(',')
        const Imagenes = await bufferimagenes(activo.url_img, activo)
        activo.BufferImagenes = Imagenes
    }


    if (activo.soportes !== null) {
        if (activo.soportes.length > 0) {
            activo.soportes = JSON.parse(activo.soportes)
            const soportes = bufferSoportespdf(activo.soportes, activo)
            activo.Buffersoportes = soportes
        }
    }

    const hojadevida = await crearPdfMake(id, 'Activo')
    activo.hojadevida = hojadevida

    res.json(
        {
            activo,
            componentes,
            reportes
        }
    )
}

const crearActivo = async (req, res) => {

    // validar permisos para crear activos
    const { sessionid, permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para crear Activos' })
    }

    // extrae los datos del req y valida que esten normalizados para ingreso a la bd
    const { datos } = req.body

    const imagenes = datos.imagenes
    const componentes = datos.componentes
    const documentos = datos.documentos
    const campos = datos
    delete campos.imagenes
    delete campos.componentes
    delete campos.documentos

    // validar datos del activo
    const validacion = await validarDatosActivo(campos, 'crear')
    if (validacion.msg) return validacion.msg

    // validar imagenes del activo
    if (imagenes.length > 0) {
        for (let imagen of imagenes) {
            const validacionImagen = validarImagenes(imagen)
            if (validacionImagen.msg) return validacionImagen
        }
    } else {
        return { msg: 'El activo debe tener almenos una Imagen' }
    }

    const documentosKey = Object.keys(documentos)
    //validar documentos si se envian
    if (documentosKey.length > 0) {
        for (let key of documentosKey) {
            const validacionDocumento = validarDocumentos(documentos[key])
            if (validacionDocumento.msg) return validacionDocumento
        }
    }

    // validar componentes si tiene 
    if (componentes.length > 0) {
        for (let componente of componentes) {
            const validacionComponente = await validarDatosComponente(componente)
            if (validacionComponente.msg) return validacionComponente
        }
    }
    // guardar el activo y retornar los datos necesarios para guardar los demas datos
    validacion.create_by = sessionid
    const nuevoActivo = await guardarNuevoActivo(validacion)
    if (nuevoActivo.msg) return nuevoActivo

    // guardar imagenes 
    let nombreImagenes = []
    for (const imagen of imagenes) {
        const guardarImagen = await guardarImagenesBase64(imagen, nuevoActivo);
        if (!guardarImagen.msg) nombreImagenes.push(guardarImagen);
    }

    //gudardar los nombres de las imagenes en la base de datos
    let guardarImagenBd
    if (nombreImagenes.length > 0) {
        guardarImagenBd = await guardarImagenes(nombreImagenes.toString(), nuevoActivo.id)
    }

    // guardar los documentos
    let nombreDocumentos = {}

    if (documentosKey.length > 0) {
        for (let key of documentosKey) {
            const data = {
                file: documentos[key],
                documento: key
            }
            const nuevoDocumento = await guardarDocumentoBase64(data, nuevoActivo)
            if (!nuevoDocumento.msg) nombreDocumentos[key] = nuevoDocumento     
        }
    }

    // guardar los nombres de los documentos en la base de datos
  
    if (Object.keys(nombreDocumentos).length > 0) {
        const nuevosoportes = JSON.stringify(nombreDocumentos)
        const soportesBd = await actualizarSoportes(nuevosoportes, nuevoActivo.id)
    }
    // guardar los componentes en la base de datos
    if (componentes.length > 0) {
        for (let componente of componentes) {
            const nuevoComponente = await crearComponente(componente, nuevoActivo.id)
        }
    }
    // devolvemos el id del nuevo activo
    res.json({ id: nuevoActivo.id })
}

const actualizarActivo = async (req, res) => {

    // valida los permisos
    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    // extrae los datos del req 

    const datos = req.body.datos
    //validar que el id corresponde al codigo interno del equipo
    const id = datos.activo.split('-')[1]

    const dataBd = await consultarCodigoInterno(id)
    if (dataBd.msg) return res.json({ msg: 'En estos momentos no es posible validar la informaciona  actualizar intetelo más tarde' })

    if (dataBd.codigo !== datos.codigoInterno) return res.json({ msg: 'El Id del activo no corresponde al codigo interno no se puede actualizar los datos' })

    const validacion = await validarDatosActivo(datos)
    if (validacion.msg) return validacion.msg

    const actualizacion = actualizarActivoDb(validacion)
    if (actualizacion.msg) return actualizacion.msg
    const activo = await consultarActivoUno(id)
    activo.fecha_compra = activo.fecha_compra.toISOString().substring(0, 10)
    activo.vencimiento_garantia = activo.vencimiento_garantia.toISOString().substring(0, 10)
    activo.fecha_creacion = activo.fecha_creacion.toISOString().substring(0, 10)
    if (activo.fecha_proximo_mtto !== null) {
        activo.fecha_proximo_mtto = activo.fecha_proximo_mtto.toISOString().substring(0, 10)
    }

    res.json({
        exito: 'Los datos del Activo se actualizaron correctamente',
        activo
    })


}

const cambiarClasificacion = async (req, res) => {

    // verifica si tiene permios para camiar la clasificacion
    const { sessionid, permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(4) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    }

    const data = req.body

    // consulta y verifica que la calsificacion actual sea diferente a la nueva
    const datosDb = await consultarCalsificacionActivoMod(data.id, data.nuevaClasificacion)
    const clasificacionActual = datosDb[0][0]

    if (clasificacionActual.clasificacionActual === data.nuevaClasificacion) {
        return res.json({ msg: 'El activo pertenea la clasificacion seleccionada' })
    }

    // verificar que exista la clasificacion
    if (!datosDb[1][0]) {
        return res.json({ msg: 'Debe seleccionar una clasificacion del listado' })
    }
    const clasificacionNueva = datosDb[1][0].existe

    // Busca el codigo del ultimo activo de la clasificacion y lo incrementa en 1
    const consecutivo = datosDb[2][0].consecutivo_interno
    const aumento = parseInt(consecutivo) + 1
    const consecutivo_interno = aumento.toString().padStart(4, 0)

    // actualiza los datos de la nueva clasificacion en la bd
    const actualizado = actualizarClasificacion(data.id, clasificacionNueva, consecutivo_interno)
    if (actualizado.msg) {
        return res.json(actualizado);
    }

    // consulta el nuevo codigo interno del activo y las nuevas siglas 
    const nuevoCodigoInterno = await consultarCodigoInterno(data.id)
    console.log(nuevoCodigoInterno)
    // copiar la carpeta, renombrarla y copiar los archivos

    const datafile = {
        siglaAntigua: clasificacionActual.siglaActual,
        siglaNueva: nuevoCodigoInterno.siglas,
        codigoAntiguo: clasificacionActual.codigoActual,
        codigoNuevo: nuevoCodigoInterno.codigo
    }

    // cambiar path de carpteta y nombre de los archivos 
    const cambioNombreCarpetas = await copiarYCambiarNombre(datafile)
    if (cambioNombreCarpetas.msg) {
        return res.json(cambioNombreCarpetas)
    }
    // cambiar nombre de los datos almacenados en la BD

    const { url_img, soportes } = nuevoCodigoInterno

    let error = {}
    if (url_img !== null || url_img !== '') {
        console.log('aqui')
        // actualizar la nombre d elas imagenes en la BD
        const nuevaUrl = url_img.replaceAll(datafile.codigoAntiguo, datafile.codigoNuevo)
        console.log(nuevaUrl, datafile.codigoAntiguo, datafile.codigoNuevo)
        const actualizarUrl_Ima = await guardarImagenes(nuevaUrl, data.id)
        if (actualizarUrl_Ima.msg) {
            error.url_img = actualizarUrl_Ima
            console.log(error.url_img)
        }
    }
    if (soportes !== null || soportes !== '') {
        const nuevoSoportes = soportes.replaceAll(datafile.codigoAntiguo, datafile.codigoNuevo)
        const actualizarSoportes = await guardarSoportes(nuevoSoportes, data.id)
        if (actualizarSoportes.msg) {
            error.actualizarSoportes = actualizarSoportes
        }
    }

    res.json({ codigoInterno: nuevoCodigoInterno.codigo })

}

const eliminarActivo = async (req, res) => {
    const { sessionid, permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(4) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para eliminar Activos' })
    }

    const data = req.body

    console.log(data)

    const datadb = await consultarCodigoInterno(data.id)
    if (datadb.codigo !== data.codigo) {
        return res.json({ msg: 'El codigo del activo no coincide con el codigo del Id del activo' })
    }
    const eliminado = eliminarActivoDb(data)
    if (eliminado.msg) {
        return res.json(eliminado)
    }

    const carpetaEliminada = eliminarCarpetaActivo(datadb)
    if (carpetaEliminada.msg) {
        return res.json(carpetaEliminada)
    }

    res.json({
        exito: 'Eliminado Correctamete',
    })
}

const guardarImagenActivo = async (req, res) => {

    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    }

    // extrae los datos del req 
    const { data } = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) {
        return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })
    }

    if (dataBd.codigo !== data.codigo) {
        return res.json({ msg: 'El Id del activo no corresponde al codigo interno no se puede actualizar los datos' })
    }

    if (!data.Imagen) return res.json({ msg: 'Debe cargar al menos una imagen' })

    let imageneDb
    if (dataBd.url_img.trim() === '') {
        imageneDb = []
    } else {
        imageneDb = dataBd.url_img.trim().split(',')
    }

    if (imageneDb.length === 6) return res.json({ msg: 'El numero maximo de imagenes por activo son 6 se ha llegado al limite favor elimine alguna para guardar nuevas imagenes' })

    const validar = validarImagenes(data.Imagen)
    if (validar.msg) return res.json(validar)

    // guardar imagen en el dicrectorio
    const nuevaImagen = await guardarImagenesBase64(data.Imagen, dataBd)
    if (nuevaImagen.msg) return res.json(nuevaImagen)

    let guardadoExitoso
    if (imageneDb.length === 0) {
        guardadoExitoso = await guardarImagenes(nuevaImagen, data.id)
    } else {
        imageneDb.push(nuevaImagen)
        guardadoExitoso = await guardarImagenes(imageneDb.toString(), data.id)
    }

    if (guardadoExitoso.msg) return res.json('los datos se guardaron correctamente, pero hubo un error al guardar las imagenes en la Base de datos intente cargarlos nuevamente si el error persiste consulte a soporte ')


    const imagen = await bufferimagen(nuevaImagen, dataBd)
    if (imagen.msg) return res.json('No se pudo devolver la imagen, por lo pornto puedes continuar con con la imagen local')

    res.json({
        exito: 'Activo actualizado correctamente',
        imagen,
        nombre: nuevaImagen
    })


}

const eliminarImagenActivo = async (req, res) => {

    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    }

    // extrae los datos del req 
    const { data } = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })

    if (dataBd.codigo !== data.codigo) return res.json({ msg: 'El Id del activo no corresponde al codigo interno no se puede actualizar los datos' })

    if (dataBd.url_img.trim() === '') return res.json({ msg: 'El del activo no tiene imagenes para eliminar' })

    const imageneDb = dataBd.url_img.trim().split(',')
    if (imageneDb.length === 1) return res.json({ msg: 'El activo solo tiene una imagen no puede eliminarla sin antes guardar otras imagenes' })
    
    // elimina la imagen de la base de datos
    const nuevaImagen = imageneDb.filter((item) => item !== data.imagen)
    const guardadoExitoso = await guardarImagenes(nuevaImagen.toString(), data.id)
    if (guardadoExitoso.msg) return res.json({ msg: 'la imagen no pudo ser eliminada de la base de datos' })
    
    //elimiar imagen de la carpeta
    const eliminada = await eliminarImagenes(data.imagen, dataBd)
    if (eliminada.msg) return res.json({ msg: 'No fue posible eliminar la imagen del directorio' })
  

    res.json({
        elimnada
    })
}

const eliminarDocumento = async (req, res) => {

    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para eliminar Documentos de Activos' })
    }

    // extrae los datos del req 
    const data = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })

    if (dataBd.soportes.trim() === null) return res.json({ msg: 'El del activo no tiene documentos para eliminar' })
    if (dataBd.soportes.trim() === '') return res.json({ msg: 'El del activo no tiene documentos para eliminar' })
    const soportes = JSON.parse(dataBd.soportes)

    //elimiar soporte
    const nombre = soportes[data.documento]
    delete soportes[data.documento]
    const eliminar = await elimnarSoportePdf(nombre, dataBd)
    if (eliminar.msg) return res.json({ msg: 'No fue posible eliminar el documento intentelo mas tarde' })
    const nuevoSoportes = JSON.stringify(soportes)
    const actualizarDB = await actualizarSoportes(nuevoSoportes, data.id)
    if (actualizarDB.msg) return res.json(actualizarDB)

    res.json(eliminar)
}

const descargarDocumento = async (req, res) => {

    // extrae los datos del req 
    const data = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })

    if (dataBd.soportes.trim() === null) return res.json({ msg: 'El  activo no tiene documentos' })
    if (dataBd.soportes.trim() === '') return res.json({ msg: 'El  activo no tiene documentos' })
    const soportes = JSON.parse(dataBd.soportes)

    //elimiar soporte
    const nombre = soportes[data.documento]
    const buffedocumento = bufferSoportepdf(nombre, dataBd)

    res.json({
        buffer: buffedocumento,
        nombre: dataBd.codigo + '-' + data.documento
    })
}

const guardarDocumento = async (req, res) => {


    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    }

    // extrae los datos del req 
    const { data } = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) {
        return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })
    }
    if (!data.file) return res.json({ msg: 'Debe cargar un documento' })
    if (!data.documento || data.documento == '') return res.json({ msg: 'No se selecciono el tipo de documento ' })


    const validar = validarDocumentos(data.file)
    if (validar.msg) return res.json(validar)

    const soportes = JSON.parse(dataBd.soportes)
    let documentoeliminar = null
    if (soportes[data.documento]) documentoeliminar = soportes[data.documento]

    // guardar documento en el dicrectorio
    const nuevoDocumento = await guardarDocumentoBase64(data, dataBd)
    if (nuevoDocumento.msg) return res.json(nuevoDocumento)

    soportes[data.documento] = nuevoDocumento
    const nuevosoportes = JSON.stringify(soportes)
    const actualizarDB = await actualizarSoportes(nuevosoportes, data.id)

    if (actualizarDB.msg) return res.json(actualizarDB)
    if (documentoeliminar !== null) await elimnarSoportePdf(documentoeliminar, dataBd)

    const bufferSoporte = await bufferSoportepdf(nuevoDocumento, dataBd)
    if (bufferSoporte.msg) return res.json(actualizarDB)

    res.json({
        data: bufferSoporte,
    })


}

const descargarHojaDeVida = async (req, res) => {

    // extrae los datos del req 
    const data = req.body

    //validar que el id corresponde al codigo interno del equipo
    const dataBd = await consultarCodigoInterno(data.id)
    if (dataBd.msg) return request.json({ msg: 'En estos momentos no es posible validar la información  actualizar intetelo más tarde' })

    const hojadevida = await crearPdfMake(data.id, 'Activo')
    res.json({
        hojadevida: `data:application/pdf;base64,${hojadevida}`,
        nombre: dataBd.codigo
    })
}

const consultarDatosActivoSolicitud = async (req, res) => {
    const id = req.body.id

    const activo = await consultarActivoSolicitud(id)
    const dataBd = await consultarCodigoInterno(id)

    if (activo.url_img !== null && activo.url_img.trim() !== '') {
        activo.url_img = activo.url_img.split(',')
        const Imagenes = await bufferimagenes(activo.url_img, dataBd)
        activo.BufferImagenes = Imagenes
    }
    res.json(activo)
} 

const consultarDatosActivoReportePrev = async (req, res) => {
    const id = req.body.id

    const consulta = await consultarActivoReportePrev(id)
    const activo = consulta[0][0]
    activo.listaEstados= consulta[1]
    activo.listaUsuarios= consulta[2]
    activo.listaProveedores= consulta[3]
    activo.listadoEstadosSolicitud= consulta[4]
    const dataBd = await consultarCodigoInterno(id)

    if(activo.proximoMto != null || activo.proximoMto != '') activo.proximoMto =  activo.proximoMto.toISOString().substring(0, 10)
    if (activo.url_img !== null && activo.url_img.trim() !== '') {
        activo.url_img = activo.url_img.split(',')
        const Imagenes = await bufferimagenes(activo.url_img, dataBd)
        activo.BufferImagenes = Imagenes
    }

    res.json(activo)
} 

export {

    consultarActivosTodos,
    consultarListasConfActivos,
    crearActivo,
    actualizarActivo,
    cambiarClasificacion,
    eliminarActivo,
    consultarActivo,
    guardarImagenActivo,
    eliminarImagenActivo,
    eliminarDocumento,
    descargarDocumento,
    guardarDocumento,
    descargarHojaDeVida,
    consultarDatosActivoSolicitud,
    consultarDatosActivoReportePrev
    
}
