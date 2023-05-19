import formidable from "formidable"
import { validarDatosActivo } from "../helpers/validarDatosActivo.js"
import { validarFiles } from "../helpers/validarFiles.js"
import { crearPdfMake } from "../helpers/crearPdfMake.js"
import { consultarReportesActivo } from "../db/sqlReportes.js"
import {
    copiarYCambiarNombre,
    guardarImagenesNuevoActivo,
    bufferimagenes,
    elimnarImagenes,
    eliminarCarpetaActivo,
    guardarPDF,
    bufferSoportespdf,
    elimnarSoportePdf
} from "../helpers/copiarCarpetasArchivos.js"

import {
    consultarActivos,
    consultarActivoUno,
    gudardarNuevoActivo,
    guardarImagenes,
    consultarCodigoInterno,
    actualizarActivoDb,
    consultarCalsificacionActivoMod,
    actualizarClasificacion,
    eliminarActivoDb,
    guardarSoportes,
    crearComponenteActivo,
    consultarComponentes,
    actualizarComponentes
} from "../db/sqlActivos.js"



const consultarActivosTodos = async (req, res) => {
    const listadoActivos = await consultarActivos()
    res.json(listadoActivos)
}

const consultarActivo = async (req, res) => {
    const id = req.body.id

    const activo = await consultarActivoUno(id)
    const componentes = await consultarComponentes(id)
    const reportes = await consultarReportesActivo(id)

    reportes.forEach(element => {
        if(element.proximoMtto != null){
            element.proximoMtto = element.proximoMtto.toLocaleDateString('es-CO')
        }        
        element.fechareporte = element.fechareporte.toLocaleDateString('es-CO')
    })


    activo.fecha_compra = activo.fecha_compra.toISOString().substring(0, 10)
    activo.vencimiento_garantia = activo.vencimiento_garantia.toISOString().substring(0, 10)
    activo.fecha_creacion = activo.fecha_creacion.toISOString().substring(0, 10)
   

    if (activo.url_img !== null && activo.url_img !== '') {
        activo.url_img = activo.url_img.split(',')
    }
    const Imagenes = await bufferimagenes(activo.url_img, activo)
 
    if (activo.soporte === '') {
        activo.soportes = JSON.parse(activo.soportes)
    }
    const soportes = bufferSoportespdf(activo.soportes, activo) 
    const hojadevida = await crearPdfMake(id, 'Activo')
    activo.BufferImagenes = Imagenes
    activo.Buffersoportes = soportes
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

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        // extrae los datos del req y valida que esten normalizados para ingreso a la bd
        const data = JSON.parse(fields.data)
        const validacion = await validarDatosActivo(data)

        if (validacion.msg) {
            res.json(validacion)
        }

        const validarFile = validarFiles(files)

        if (validarFile.msg) {
            return res.json(validarFile)
        }

        // anexamos los datos de create by, fecha de creacion
        data.create_by = sessionid
        data.fecha_creacion = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')

        // guardamos los datos en la bd y devolvemos el codigo el id y el tipo de activo
        const dataActivo = await gudardarNuevoActivo(data)
        if (dataActivo.msg) {
            return res.json(dataActivo)
        }

        // cargamos en la base de datos loc componentes asociados al activo
        //almacena los errores  que se presenten
        let error = {}

        if (data.componentes) {
            const guardarComponentes = await crearComponenteActivo(data.componentes, dataActivo.id)
            if (guardarComponentes.msg) {
                error.guardarComponentes = guardarComponentes
            } else {
                data.componentes = guardarComponentes[0]
            }
        }
        // quitar espacios en blanco y devolver el id del componente 
        //anexamos los datos de codigo
        data.codigo = dataActivo.codigo
        data.id = dataActivo.id

        // guarda las imagenes en la ruta perteneciente al activo y devolver los nombres de la imagenes
        const url_img = await guardarImagenesNuevoActivo(files, dataActivo)
        if (url_img.msg) {
            error.url_img = url_img.msg
        } else {
            data.url_img = url_img
            // guardar el listado de images en la base de datos
            const guardadoExitoso = await guardarImagenes(url_img.toString(), data.id)
            if (guardadoExitoso.msg) {
                error.url_img = 'los datos se guardaron correctamente, pero hubo un error al guardar las imagenes en la Base de datos '
            }
        }

        let soportes = {}

        if (files.Factura) {
            const factura = await guardarPDF(files.Factura, dataActivo, 'Factura')
            if (factura.msg) {
                error.factura = factura.msg
            } else {
                soportes.factura = factura
            }
        }

        if (files.Importacion) {
            const importacion = await guardarPDF(files.Importacion, dataActivo, 'Importacion')
            if (importacion.msg) {
                error.importacion = importacion.msg
            } else {
                soportes.importacion = importacion
            }
        }

        if (files.Invima) {
            const invima = await guardarPDF(files.Invima, dataActivo, 'Invima')
            if (invima.msg) {
                error.invima = invima.msg
            } else {
                soportes.invima = invima
            }
        }

        if (files.ActaEntrega) {
            const actaEntrega = await guardarPDF(files.ActaEntrega, dataActivo, 'ActaEntrega')
            if (actaEntrega.msg) {
                error.actaEntrega = actaEntrega.msg
            } else {
                soportes.actaEntrega = actaEntrega
            }
        }

        if (files.Garantia) {
            const garantia = await guardarPDF(files.Garantia, dataActivo, 'Garantia')
            if (garantia.msg) {
                error.garantia = garantia.msg
            } else {
                soportes.garantia = garantia
            }
        }

        if (files.Manual) {
            const manual = await guardarPDF(files.Manual, dataActivo, 'Manual')
            if (manual.msg) {
                error.manual = manual.msg
            } else {
                soportes.manual = manual
            }
        }

        if (files.Otro) {
            const otro = await guardarPDF(files.Otro, dataActivo, 'Otro')
            if (otro.msg) {
                error.otro = otro.msg
            } else {
                soportes.otro = otro
            }
        }

        const soportestring = JSON.stringify(soportes)
        if (Object.keys(soportes).length !== 0) {
            const guardardo = await guardarSoportes(soportestring, data.id)
            if (guardardo.msg) {
                error.soporte = 'ocurrio un error al guardar los soportes en la base de datos'
            }
        }

        if (Object.keys(error).length !== 0) {
            data.error = error
        }
        //optener un buffer de las imagenes 
        const Imagenes = bufferimagenes(url_img, dataActivo)
        const bufferSoportes = bufferSoportespdf(soportes, dataActivo)
        data.soportes = JSON.parse(soportestring)
        const hojadevida = await crearPdfMake(data.id, 'Activo')
        // enviar respuesta con los datos del activo 
        res.json({
            msg: 'Activo creado correctamente',
            data,
            Imagenes,
            bufferSoportes,
            hojadevida
        })

    });
}

const actualizarActivo = async (req, res) => {

    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para Actualizar Activos' })
    }

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });
    form.parse(req, async function (err, fields, files) {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        // extrae los datos del req 
        const data = JSON.parse(fields.data)



        //validar que el id corresponde al codigo interno del equipo
        const dataBd = await consultarCodigoInterno(data.id)
        if (dataBd.msg) {
            return request.json({ msg: 'En estos momentos no es posible validar la informaciona  actualizar intetelo más tarde' })
        }

        if (dataBd.codigo !== data.codigo) {
            return res.json({ msg: 'El Id del activo no corresponde al codigo interno no se puede actualizar los datos' })
        }

        // validar si se elimino alguna imagen
        if (data.url_img.length <= 0 && !files.Image) {
            return res.json({ msg: 'No se puede eliminar todas las imagenes' })
        }

        let imageneDb = dataBd.url_img.split(',')
        const ElminoImagen = JSON.stringify(imageneDb) === JSON.stringify(data.url_img)
        // valida que esten normalizados para ingreso a la bd
        const validacion = await validarDatosActivo(data, true)
        if (validacion.msg) {
            return res.json(validacion)
        }
        // validar si hubo cambio en los componentes
        let errores = {}
        let modificoComponentes = true
        const componentesDb = await consultarComponentes(data.id)
        if (componentesDb.msg) {
            errores.componentes = componentesDb.msg
        } else {
            modificoComponentes = JSON.stringify(componentesDb) === JSON.stringify(data.componentes)
        }


        // validar archivos enviados 
        const validarFile = validarFiles(files)
        if (validarFile.msg) {
            return res.json(validarFile)
        }

        // crea un nuevo arreglo con los nombres de las imagenes
        let imagenesEliminar

        if (!ElminoImagen) {
            imagenesEliminar = imageneDb.filter(image => !data.url_img.includes(image))
        }

        // verificar si existen imagenes guardarlas

        if (files.Image) {
            const nuevaUrl_imag = await guardarImagenesNuevoActivo(files, dataBd)
            if (nuevaUrl_imag.msg) {
                errores.url_img = nuevaUrl_imag.msg
            } else {
                const nuevasImages = nuevaUrl_imag.concat(data.url_img)
                data.url_img = nuevasImages
            }
        }

        // validar que soporte se va a elimiar o reemplazar
        let nuevosSoportes = {}
        if (dataBd.soportes !== JSON.stringify(data.soportes)) {
            //extrae los soportes de bd y los enviados en la actualizacion

            const soportesBD = JSON.parse(dataBd.soportes)
            const { soportes } = data
            // valida si la factura se elimina o reemplaza
            if (!soportes.factura) {

                await elimnarSoportePdf(soportesBD.factura, dataBd)
            } else {
                nuevosSoportes.factura = soportes.factura
            }

            if (files.Factura) {
                const factura = await guardarPDF(files.Factura, dataBd, 'Factura')
                if (factura.msg) {
                    errores.factura = factura.msg
                } else {
                    nuevosSoportes.factura = factura
                }
            }
            // valida si la importacion se elimina o reemplaza
            if (!soportes.importacion) {
                elimnarSoportePdf(soportesBD.importacion, dataBd)
            } else {
                nuevosSoportes.importacion = soportes.importacion
            }
            if (files.Importacion) {
                const importacion = await guardarPDF(files.Importacion, dataBd, 'Importacion')
                if (importacion.msg) {
                    errores.importacion = importacion.msg
                } else {
                    nuevosSoportes.importacion = importacion
                }
            }

            // valida si la invima se elimina o reemplaza
            if (!soportes.invima) {
                elimnarSoportePdf(soportesBD.invima, dataBd)
            } else {
                nuevosSoportes.invima = soportes.invima
            }
            if (files.Invima) {
                const invima = await guardarPDF(files.Invima, dataBd, 'Invima')
                if (invima.msg) {
                    errores.invima = invima.msg
                } else {
                    nuevosSoportes.invima = invima
                }
            }

            // valida si la actaEntrega se elimina o reemplaza
            if (!soportes.actaEntrega) {
                elimnarSoportePdf(soportesBD.actaEntrega, dataBd)
            } else {
                nuevosSoportes.actaEntrega = soportes.actaEntrega
            }
            if (files.ActaEntrega) {
                const actaEntrega = await guardarPDF(files.ActaEntrega, dataBd, 'ActaEntrega')
                if (actaEntrega.msg) {
                    errores.actaEntrega = actaEntrega.msg
                } else {
                    nuevosSoportes.actaEntrega = actaEntrega
                }
            }

            // valida si la garantia se elimina o reemplaza
            if (!soportes.garantia) {
                elimnarSoportePdf(soportesBD.garantia, dataBd)
            } else {
                nuevosSoportes.garantia = soportes.garantia
            }
            if (files.Garantia) {
                const garantia = await guardarPDF(files.Garantia, dataBd, 'Garantia')
                if (garantia.msg) {
                    errores.garantia = garantia.msg
                } else {
                    nuevosSoportes.garantia = garantia
                }
            }

            if (!soportes.manual) {
                elimnarSoportePdf(soportesBD.manual, dataBd)
            } else {
                nuevosSoportes.manual = soportes.manual
            }
            if (files.Manual) {
                const manual = await guardarPDF(files.Manual, dataBd, 'Manual')
                if (manual.msg) {
                    errores.manual = manual.msg
                } else {
                    nuevosSoportes.manual = manual
                }
            }

            if (!soportes.otro) {
                elimnarSoportePdf(soportesBD.otro, dataBd)
            } else {
                nuevosSoportes.otro = soportes.otro
            }
            if (files.Otro) {
                const otro = await guardarPDF(files.Otro, dataBd, 'Otro')
                if (otro.msg) {
                    errores.otro = otro.msg
                } else {
                    nuevosSoportes.otro = otro
                }
            }

            // pasa el nuvo objeto de soportes
            data.soportes = nuevosSoportes
        }

        // actualizar activo en bd
        data.url_img = data.url_img.toString()
        data.soportes = JSON.stringify(data.soportes)

        //actualiza los components en la bd

        if (!modificoComponentes) {
            const componentesActualizado = await actualizarComponentes(data.componentes, data.id)
            if (componentesActualizado.msg) {
                errores.componentes = componentesActualizado.msg
            } else {
                data.componentes = componentesActualizado
            }
        }

        // actualzia el activo en la bd
        const actualizarActivo = await actualizarActivoDb(data)
        if (actualizarActivo.msg) {
            return res.json(actualizarActivo)
        }


        if (!ElminoImagen) {
            await elimnarImagenes(imagenesEliminar, dataBd)
        }

        data.url_img = data.url_img.split(',')
        data.soportes = JSON.parse(data.soportes)
        // devolver los nuevos datos del activo y las imagenes

        const Imagenes = bufferimagenes(data.url_img, dataBd)
        const bufferSoportes = bufferSoportespdf(data.soportes, dataBd)
        const hojadevida = await crearPdfMake(data.id, 'Activo')

        // enviar respuesta con los datos del activo e imagenes
        res.json({
            msg: 'Activo actualizado correctamente',
            data,
            Imagenes,
            bufferSoportes,
            hojadevida,
            errores
        })

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

    const datadb = await consultarCodigoInterno(data.id)
    if (datadb.codigo !== data.codigo) {
        return res.json({ msg: 'El codigo ingresado no coincide con el codigo del activo' })
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
        msg: 'Eliminado Correctamete',
        data
    })
}

export {
    consultarActivosTodos,
    crearActivo,
    actualizarActivo,
    cambiarClasificacion,
    eliminarActivo,
    consultarActivo
}
