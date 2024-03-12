import {
    consultarlistasInsumo,
    consultarListadoInsumosBodega,
    consultarInsumosBodega,
    guardarInsumo,
    consultarCantidadInsumo,
    movimientoBodegaInsumos,
    datosValidarInsumo,
    actualizarInsumoBd,
    actualizarImagenInsumo,
    actualizarFacturaInsumo,
    consultarInsumoAuxiliar,
    movimientoEntreBodegaInsumos
} from "../db/sqlInsumos.js"

import { consultaconfi } from "../db/sqlConfig.js"
import { consultarDataUsuario } from '../db/sqlUsuarios.js'
import { validarImagenes, validarDocumentos } from "../helpers/validarFiles.js"

import {
    guardarImagenesBase64,
    guardarDocumentoBase64,
    bufferimagen,
    bufferfacturaInsumo,
    eliminarImagenes,
    elimnarFactInsumo,
    copiarCambiarNombreCArpeta
} from "../helpers/copiarCarpetasArchivos.js"

const consultartablasInsumo = async (req, res) => {
    try {
        const { permisos } = req
        if (permisos.indexOf(7) === -1) return res.json({ msg: 'Usted no tiene permisos para este modulo' })

        const consulta = await consultarlistasInsumo()
        if (consulta.msg) return res.json({ msg: 'No fue posible consultar los datos de configuracion' })
        res.json(consulta)

    } catch (err) {
        console.log(err)
        res.json({ msg: 'Error al intentar consultar el listrado de insumos' })

    }

}

const listadoInsumosBodega = async (req, res) => {
    try {
        const { permisos } = req
        if (permisos.indexOf(7) === -1) return res.json({ msg: 'Usted no tiene permisos para este modulo' })
        const id = req.body.id
        if(isNaN(parseInt(id))) return res.json({ msg: 'Debe seleccionar una Bodega del Listado'})
        const consulta = await consultarListadoInsumosBodega(id)
        if (consulta.msg) return res.json(consulta)

        res.json(consulta)

    } catch (err) {

        res.json({ msg: 'Error al intentar consultar el listrado de insumos' })

    }

}

const ingresoInicalInsumo = async (req, res) => {

    try {

        const { sessionid, permisos } = req

        if (permisos.indexOf(9) == -1) return res.json({ msg: 'Usted no no tiene permiso para ingresar Insumo' })

        const data = req.body

        if (data.insumo.includes('--')) return res.json({ msg: 'Insumo invalido. Debe selecionar un Insumo Valido' })
        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'Insumo invalido. Debe selecionar un Insumo Valido' })
        // validar insumo 1 idInsumo
        const listas = await consultarlistasInsumo()
        if (!listas[0].some(element => element.id === idInsumo)) return res.json({ msg: 'Insumo invalido. Debe selecionar un Insumo Valid del listado' })

        // validar bodega 2 idBodega
        const idBodega = parseInt(data.bodega.split('-')[1])
        if (isNaN(idBodega)) return res.json({ msg: 'Bodega invalida. Debe selecionar una Bodega Valida del listado' })
        if (!listas[1].some(element => element.id === idBodega)) return res.json({ msg: 'Bodega invalida. Debe selecionar una Bodega Valida del listado' })

        // validar marca 3 marca
        const idMarca = parseInt(data.marca.split('-')[1])
        if (isNaN(idMarca)) return res.json({ msg: 'Marca invalida. Debe selecionar una Marca Valida del listado' })
        if (!listas[2].some(element => element.id === idMarca)) return res.json({ msg: 'Marca invalida. Debe selecionar una Marca Valida del listado' })

        // validar proveedor 4 proveedor
        const idProveedor = parseInt(data.proveedor.split('-')[1])
        if (isNaN(idProveedor)) return res.json({ msg: 'Proveedor invalido. Debe selecionar un Proveedor Valido del listado' })
        if (!listas[2].some(element => element.id === idProveedor)) return res.json({ msg: 'Proveedor invalido. Debe selecionar un Proveedor Valido del listado' })

        // validar modelo 5 modelo
        if (data.modelo !== '') {
            if (data.modelo.trim() !== '') {
                if (validarPalabras(data.modelo)) return res.json({ msg: 'El campo modelo contiene palabras reservadas como from, select, insert, update' })

                if (data.modelo.length > 30) return res.json({ msg: 'El campo modelo excede los 30 caracteres' })
            }
        }
        // validar serie 6 serie
        if (data.serie !== '') {
            if (data.serie.trim() !== '') {
                if (validarPalabras(data.serie)) return res.json({ msg: 'El campo serie contiene palabras reservadas como from, select, insert, update' })

                if (data.serie.length > 30) return res.json({ msg: 'El campo serie excede los 30 caracteres' })


            }
        }
        // validar descripcion 7 descripcion
        if (data.descripcion !== '') {
            if (data.descripcion.trim() !== '') {
                if (validarPalabras(data.descripcion)) return res.json({ msg: 'El campo descripcion contiene palabras reservadas como from, select, insert, update' })

                if (data.descripcion.length > 500) return res.json({ msg: 'El campo descripcion excede los 500 caracteres' })


            }
        }
        // validar factura 8 factura
        if (data.factura == '') return res.json({ msg: 'Debe ingresar el numero de factura' })
        if (data.factura.trim() == '') return res.json({ msg: 'Debe ingresar el numero de factura' })
        if (validarPalabras(data.factura)) return res.json({ msg: 'El campo factura contiene palabras reservadas como from, select, insert, update' })
        if (data.factura.length > 100) return res.json({ msg: 'El campo factura excede los 30 caracteres' })

        // validar costo 9 costo_Unitario
        if (data.valor == '') return res.json({ msg: 'Debe ingresar el COSTO UNITARIO' })
        if (data.valor.trim() == '') return res.json({ msg: 'Debe ingresar el COSTO UNITARIO' })
        if (isNaN(parseFloat(data.valor))) return res.json({ msg: 'El COSTO UNITARIO debe ser un numero' })
        if (data.valor < 0) return res.json({ msg: 'El COSTO UNITARIO debe ser mayor a 0' })

        // validar CANTIDAD 10 costo_Unitario
        if (data.cantidad == '') return res.json({ msg: 'Debe ingresar la CANTIDAD del insumo' })
        if (data.cantidad.trim() == '') return res.json({ msg: 'Debe ingresar la CANTIDAD del insumo' })
        if (isNaN(parseFloat(data.cantidad))) return res.json({ msg: 'La CANTIDAD debe ser un numero' })
        if (data.cantidad <= 0) return res.json({ msg: 'La CANTIDAD debe ser mayor a 0' })

        // validar fecha de compra 11 fechaCompra
        if (data.fecha == '') return res.json({ msg: 'Debe ingresar la Fecha de Compra' })
        if (data.fecha.trim() == '') return res.json({ msg: 'Debe ingresar la Fecha de Compra' })
        const fechaCompraInsumo = new Date(data.fecha).toISOString().substring(0, 10)
        if (fechaCompraInsumo instanceof Date && !isNaN(fechaCompraInsumo)) return res.json({ msg: 'La fecha de compra no es valida' })
        const timestamp = Date.now();
        const fechaActual = new Date(timestamp).toISOString().substring(0, 10)
        if (fechaActual < fechaCompraInsumo) return res.json({ msg: 'la fecha de compra no puede ser mayor al dia de hoy' })

        let imagen = false
        let facturaPdf = false
        if (data.imagen !== '') {
            if (data.imagen.trim() !== '') {
                const validarimagen = validarImagenes(data.imagen)
                if (validarimagen.msg) return res.json(validarimagen)
                imagen = true
            }
        }

        if (data.facturaPdf !== '') {
            if (data.facturaPdf.trim() !== '') {
                const validarDocumento = validarDocumentos(data.facturaPdf)
                if (validarDocumento.msg) return res.json(validarDocumento)
                facturaPdf = true
            }
        }


        const datos = {
            idInsumo,
            idBodega,
            cantidad: data.cantidad,
            costo_Unitario: data.valor,
            factura: data.factura,
            marca: idMarca,
            modelo: data.modelo,
            serie: data.serie,
            proveedor: idProveedor,
            fechaCompra: fechaCompraInsumo,
            descripcion: data.descripcion,
            fechaTranscion: new Date(timestamp).toISOString().slice(0, 19).replace('T', ' '),
            usuario: sessionid,
        }

        const insumo = await guardarInsumo(datos)
        if (insumo.msg) return res.json(insumo)

        if (imagen) {
            const imagenGuardada = await guardarImagenesBase64(data.imagen, insumo.id, 4)
            if (imagenGuardada.msg) return res.json({ msg: 'No fue posible guardar la imagen del insumo' })

            const imagenInsumobd = await actualizarImagenInsumo(insumo.id, imagenGuardada)
            if (imagenInsumobd.msg) return res.json({ msg: 'No fue posible guardar la imagen del insumo en la base de datos' })

        }

        if (facturaPdf) {
            const facturaGuardada = await guardarDocumentoBase64({ file: data.facturaPdf }, { id: insumo.id, factura: data.factura }, 4)
            if (facturaGuardada.msg) return res.json({ msg: 'No fue posible guardar la factura del insumo' })

            const facturaInsumobd = await actualizarFacturaInsumo(insumo.id, facturaGuardada)
            if (facturaInsumobd.msg) return res.json({ msg: 'No fue posible guardar la factura del insumo en la base de datos, intentelo nuevamente' })

        }




        res.json({ exito: 'Insumo Creado Correctamente', id: insumo.id })


    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible guardar el Insumo' })

    }

}

const consultarUnInsumo = async (req, res) => {

    try {

        const { permisos } = req
        if (permisos.indexOf(7) === -1) return res.json({ msg: 'Usted no tiene permisos para realizar esta operacion' })
        const id = req.body.id
        if (isNaN(parseInt(id))) return res.json({ msg: 'Insumo no valido' })

        const consulta = await consultarInsumosBodega(id)
        if (consulta.msg) return res.json(consulta)

        const insumo = consulta[0][0]

        if (insumo.imagen !== null && insumo.imagen !== '' && insumo.imagen !== undefined) {
            insumo.bufferImagen = await bufferimagen(insumo.imagen, insumo.id.split('-')[1], 4)
        } else {
            delete insumo.imagen
        }

        if (insumo.FacturaPdf !== null && insumo.FacturaPdf !== '' && insumo.FacturaPdf !== undefined) {
            insumo.bufferFactura = await bufferfacturaInsumo(insumo.id.split('-')[1], insumo.FacturaPdf)
        } else {
            delete insumo.FacturaPdf
        }
        const movimientos = consulta[1]
        const usuarios = consulta[2]
        const bodegas = consulta[3]

        insumo.fechaCompra = insumo.fechaCompra.toISOString().substring(0, 10)
        movimientos.forEach(element => element.fechaMovimiento = element.fechaMovimiento.toISOString().slice(0, 19).replace('T', ' '))
        const data = { insumo, movimientos, usuarios, bodegas }
        if (permisos.indexOf(9) !== -1) data.editar = true
        if (permisos.indexOf(10) !== -1) data.arqueo = true

        res.json(data)

    } catch (err) {
        console.log(err)

        res.json({ msg: 'Error al intentar consultar los datos de lo insumos' })

    }

}

const movimientoInsumoBodega = async (req, res) => {
    try {

        const { sessionid, permisos } = req


        // validar permios
        if (permisos.indexOf(7) === -1) return res.json({ msg: 'Usted no tiene permisos para realizar esta operacion' })

        // validar insumo
        const movimiento = req.body
        if (!movimiento.insumo || !movimiento.idInsumno || !movimiento.tipo || !movimiento.cantidad) return res.json({ msg: 'Los datos del insumo estan incompletos' })

        if (movimiento.insumo !== movimiento.idInsumno) return res.json({ msg: 'No es posible validar el insumo' })
        const idInsumo = movimiento.idInsumno.split('-')[1]
        if (isNaN(parseInt(idInsumo))) return res.json({ msg: 'Insumo no Valido' })

        const insumoBd = await consultarCantidadInsumo(idInsumo)
        if (insumoBd.msg) return res.json(insumoBd)
        if (insumoBd === undefined) return res.json({ msg: 'El Insumo no es valido O no pudo validarse' })

        // validaar tipo de movimiento
        if (isNaN(parseInt(movimiento.tipo))) return res.json({ msg: 'El tipo de movimiento no es valido' })

        // validar cantidad
        if (isNaN(parseFloat(movimiento.cantidad))) return res.json({ msg: 'La cantidad a mover debe ser numerica' })
        // establecemos la fecha actual
        const timestamp = Date.now();
        const hoy = new Date(timestamp)
        hoy.setHours(hoy.getHours() - 5)
        const fecha = hoy.toISOString().slice(0, 23).replace('T', ' ')

        // validar usuario y o bodega en salidas ppara casos de transdados entre bodegas
        let usuariodestino
        let bodegaDestinoSalida
        let idAuxiliar = null

        // consolidacion de datos acode al movimiento
        let data = {}
        let cantidadNueva
        switch (movimiento.tipo) {
            case 1:
                if (movimiento.usuarioDestino !== 'Us--0') {
                    const usuarioDestino = movimiento.usuarioDestino.split('-')[1]
                    if (isNaN(parseInt(usuarioDestino))) return res.json({ msg: 'El usuario ingresado no es valido' })
                    const usuario = await consultarDataUsuario(usuarioDestino)
                    if (usuario === undefined) return res.json({ msg: 'El usuario ingresado no existe' })
                    if (usuario.msg) return res.json({ msg: 'No fue posible validar el usuario' })
                    usuariodestino = parseInt(movimiento.usuarioDestino.split('-')[1])
                } else {
                    usuariodestino = sessionid
                }

                cantidadNueva = insumoBd.cantidad + parseFloat((movimiento.cantidad))
                data = {
                    transaccion: 1,
                    cantidad: parseFloat(movimiento.cantidad),
                    usuario: sessionid,
                    idInsumoBodega: idInsumo,
                    usuariodestino,
                    fecha,
                    cantidadAnterior: insumoBd.cantidad,
                    descripcionAqueo: movimiento.ObservacionesInsumo,
                    cantidadNueva,
                    bodegaDestino: insumoBd.idBodega,
                }

                break

            case 2:
                // validamos que la cantidad a salir sea menor igual a la cantidad del insumo
                if (parseFloat(movimiento.cantidad) > insumoBd.cantidad) res.json({ msg: 'Para salidar la cantidad a mover debe ser menor o igual a la cantidad Actual del insumo' })
                // validamos el usuario de destino
                if (!movimiento.usuarioDestino) return res.json({ msg: 'Debe seleccionar un usuario' })
                if (movimiento.usuarioDestino == 'Us--0') return res.json({ msg: 'Debe seleccionar un usuario' })

                const usuarioDestino = movimiento.usuarioDestino.split('-')[1]
                if (isNaN(parseInt(usuarioDestino))) return res.json({ msg: 'El usuario ingresado no es valido' })

                const usuario = await consultarDataUsuario(usuarioDestino)
                if (usuario === undefined) return res.json({ msg: 'El usuario ingresado no existe' })
                if (usuario.msg) return res.json({ msg: 'No fue posible validar el usuario de destino' })
                usuariodestino = parseInt(movimiento.usuarioDestino.split('-')[1])
                // valiodamos la bodega si se escogio
                if (!movimiento.bodegaDestino) return res.json({ msg: 'Los datos estan incompletos recargue la aplicacion e intentelo de nuevo' })
                if (movimiento.bodegaDestino !== 'Bo--0') {
                    // validamos la bodega y el usuario de destino
                    const bodega = movimiento.bodegaDestino.split('-')[1]
                    if (isNaN(parseInt(bodega))) return res.json({ msg: 'la bodega ingresada no es valido, debe escoger una bodega de la lista' })
                    if (usuariodestino == 192) return res.json({ msg: 'se ingreso una Bodega el usuario destino no puede ser Nr' })
                    const listas = await consultarlistasInsumo()
                    if (listas.msg) return res.json({ msg: 'No fue posible validar la bodega' })

                    if (!listas[1].some(element => element.id === parseInt(bodega))) return res.json({ msg: 'La bodega de destino no existe' })
                    bodegaDestinoSalida = parseInt(bodega)
                    // definimos el id insumo que debemos validar en la bodega de destino para actualizar o crear el insumo 
                    if (bodegaDestinoSalida !== insumoBd.idBodega) {

                        if (insumoBd.idInsumoAuxiliar === null) {
                            idAuxiliar = insumoBd.id
                        } else {
                            idAuxiliar = insumoBd.idInsumoAuxiliar
                        }
                        // consultamos si existe el insumo en la bodega de destino
                        const consultarAuxiliar = await consultarInsumoAuxiliar(idAuxiliar, bodegaDestinoSalida)

                        if (consultarAuxiliar.msg) return res.json({ msg: ' No de pudo realizar el movimiento en la base de datos' })
                    
                        if (consultarAuxiliar[0].length > 0 || consultarAuxiliar[1].length > 0) {
                            let datosAuxiliar
                            if (consultarAuxiliar[0].length > 0) datosAuxiliar = consultarAuxiliar[0][0]
                            if (consultarAuxiliar[1].length > 0) datosAuxiliar = consultarAuxiliar[1][0]

                            cantidadNueva = datosAuxiliar.cantidad + parseFloat((movimiento.cantidad))

                            const data = {

                                transaccion: 1,
                                cantidad: parseFloat(movimiento.cantidad),
                                usuario: sessionid,
                                idInsumoBodega: datosAuxiliar.id,
                                usuariodestino,
                                fecha,
                                cantidadAnterior: datosAuxiliar.cantidad,
                                descripcionAqueo: 'Insumo remitido desde la bodega ' + insumoBd.bodega,
                                cantidadNueva,
                                bodegaorigen: insumoBd.idBodega,
                                bodegaDestino: bodegaDestinoSalida,
                            }

                            const movimientoEntreBodega = await movimientoEntreBodegaInsumos(data)
                            if (movimientoEntreBodega.msg) return res.json({ msg: 'no fue posible realizar el movimiento' })


                        } else {
                            //si no existe creamos el insumo en la bodega
                            const data = {

                                transaccion: 1,
                                cantidad: parseFloat(movimiento.cantidad),
                                usuario: sessionid,
                                idInsumoBodega: idInsumo,
                                usuariodestino,
                                fecha,
                                cantidadAnterior: 0,
                                descripcionAqueo: 'Insumo remitido desde la bodega ' + insumoBd.bodega,
                                cantidadNueva: parseFloat(movimiento.cantidad),
                                bodegaorigen: insumoBd.idBodega,
                                bodegaDestino: bodegaDestinoSalida,
                                idAuxiliar
                            }
                            const movimientoEntreBodega = await movimientoEntreBodegaInsumos(data, true)
                            if (movimientoEntreBodega.msg) return res.json({ msg: 'no fue posible realizar el movimiento' })

                            if ((movimientoEntreBodega.imagen !== null && movimientoEntreBodega.imagen !== '') || (movimientoEntreBodega.FacturaPdf !== null && movimientoEntreBodega.FacturaPdf !== '')) {
                                copiarCambiarNombreCArpeta({ id: movimientoEntreBodega.idInsumoAuxiliar, idNuevo: movimientoEntreBodega.id })
                            }
                        }
                    }

                } else {
                    bodegaDestinoSalida = insumoBd.idBodega
                }

                cantidadNueva = insumoBd.cantidad - parseFloat((movimiento.cantidad))
                data = {
                    transaccion: 2,
                    cantidad: parseFloat(movimiento.cantidad),
                    usuario: sessionid,
                    idInsumoBodega: parseInt(idInsumo),
                    usuariodestino,
                    fecha,
                    cantidadAnterior: insumoBd.cantidad,
                    descripcionAqueo: movimiento.ObservacionesInsumo,
                    cantidadNueva,
                    bodegaDestino: bodegaDestinoSalida,
                }

                break

            case 3:
                cantidadNueva = parseFloat(movimiento.cantidad)
                data = {
                    transaccion: 3,
                    cantidad: cantidadNueva,
                    usuario: sessionid,
                    idInsumoBodega: idInsumo,
                    usuariodestino: sessionid,
                    fecha,
                    cantidadAnterior: insumoBd.cantidad,
                    descripcionAqueo: movimiento.ObservacionesInsumo,
                    cantidadNueva,
                    bodegaDestino: insumoBd.idBodega,
                }

                break

            default:

                return res.json({ msg: 'Movimiento Invalido' })
        }

        const nuevoMovimiento = await movimientoBodegaInsumos(data)
        if (nuevoMovimiento.msg) return res.json(nuevoMovimiento)
        nuevoMovimiento.fechaMovimiento = nuevoMovimiento.fechaMovimiento.toISOString().slice(0, 19).replace('T', ' ')
        nuevoMovimiento.exito = 'Movimiento realizado exitosamente'
        nuevoMovimiento.cantidadActual = cantidadNueva

        res.json(nuevoMovimiento)

    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible realizar el movimiento' })

    }

}

const actualizarFactInsumo = async (req, res) => {

    try {

        const { permisos } = req
        if (permisos.indexOf(9) == -1) return res.json({ msg: 'Usted no no tiene permiso para actualizar la factura del Insumo' })

        const data = req.body
        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })

        if (data.factura == '') {
            return res.json({ msg: 'Debe ingresar el numero de factura' })
        } else {
            if (data.factura.trim() == '') {
                return res.json({ msg: 'Debe ingresar el numero de factura' })
            } else {
                if (validarPalabras(data.factura)) return res.json({ msg: 'El campo factura contiene palabras reservadas como from, select, insert, update' })
            }
        }

        const insumo = await datosValidarInsumo(idInsumo)
        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })

        const validarDocumento = validarDocumentos(data.soportePDF)
        if (validarDocumento.msg) return res.json(validarDocumento)

        const facturaGuardada = await guardarDocumentoBase64({ file: data.soportePDF }, { id: insumo.id, factura: data.factura }, 4)
        if (facturaGuardada.msg) return res.json({ msg: 'No fue posible guardar la factura del insumo' })

        const facturaInsumobd = await actualizarFacturaInsumo(insumo.id, facturaGuardada)
        if (facturaInsumobd.msg) return res.json({ msg: 'No fue posible guardar la factura del insumo en la base de datos, intentelo nuevamente' })

        return res.json({ exito: 'Factura guardada correctamente', nombre: facturaGuardada })

    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible guardar la factura' })

    }

}

const guardarImagInsumo = async (req, res) => {

    try {

        const { permisos } = req
        if (permisos.indexOf(9) == -1) return res.json({ msg: 'Usted no no tiene permiso para actualizar la imagen del Insumo' })

        const data = req.body
        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })

        const insumo = await datosValidarInsumo(idInsumo)
        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })

        const validarimagen = validarImagenes(data.dataImagen)
        if (validarimagen.msg) return res.json(validarimagen)

        const imagenGuardada = await guardarImagenesBase64(data.dataImagen, insumo.id, 4)
        if (imagenGuardada.msg) return res.json({ msg: 'No fue posible guardar la imagen del insumo' })

        const imagenInsumobd = await actualizarImagenInsumo(insumo.id, imagenGuardada)
        if (imagenInsumobd.msg) return res.json({ msg: 'No fue posible guardar la imagen del insumo en la base de datos' })

        return res.json({ exito: 'Imagen guardada correctamente', nombre: imagenGuardada })

    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible guardar la factura' })

    }

}

const actualizarInsumo = async (req, res) => {

    try {

        const { permisos } = req
        if (permisos.indexOf(9) == -1) return res.json({ msg: 'Usted no no tiene permiso para actualizar los datos del Insumo' })

        const data = req.body

        if (data.insumo !== data.idInsumo) return res.json({ msg: 'Insumo invalido. Debe selecionar un Insumo Valido' })
        const idInsumo = data.idInsumo.split('-')[1]
        if (isNaN(parseInt(idInsumo))) return res.json({ msg: 'Insumo invalido. Debe selecionar un Insumo Valido' })
        let set = []

        const insumo = await datosValidarInsumo(idInsumo)
        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })

        if (data.modeloInsumo !== insumo.modelo) {
            if (data.modeloInsumo == '') {
                set.push("modelo = '" + "'")
            } else {
                if (data.modeloInsumo.trim() == '') {
                    set.push("modelo = '" + "'")
                } else {
                    if (validarPalabras(data.modeloInsumo)) return res.json({ msg: 'El campo modelo contiene palabras reservadas como from, select, insert, update' })
                    set.push("modelo = '" + data.modeloInsumo.trim() + "' ")
                }

            }
        }

        if (data.serieInsumo !== insumo.serie) {
            if (data.serieInsumo == '') {
                set.push("serie = '" + "'")
            } else {
                if (data.modeloInsumo.trim() == '') {
                    set.push("serie = '" + "'")
                } else {
                    if (validarPalabras(data.serieInsumo)) return res.json({ msg: 'El campo serie contiene palabras reservadas como from, select, insert, update' })
                    set.push("serie = '" + data.serieInsumo.trim() + "' ")

                }

            }
        }

        if (data.facturaInsumo !== insumo.factura) {
            if (data.facturaInsumo == '') {
                return res.json({ msg: 'Debe ingresar el numero de factura' })
            } else {
                if (data.facturaInsumo.trim() == '') {
                    return res.json({ msg: 'Debe ingresar el numero de factura' })
                } else {
                    if (validarPalabras(data.facturaInsumo)) return res.json({ msg: 'El campo factura contiene palabras reservadas como from, select, insert, update' })
                    set.push("factura = '" + data.facturaInsumo.trim() + "' ")

                }

            }
        }

        if (parseFloat(data.costoInsumo) !== insumo.costo_Unitario) {
            if (isNaN(parseFloat(data.costoInsumo))) return res.json({ msg: 'El costo unitario debe ser un numero' })
            set.push('costo_Unitario = ' + parseFloat(data.costoInsumo))
        }

        const fechaCompraInsumo = new Date(data.fechaCompraInsumo).toISOString().substring(0, 10)
        const fechaCompra = new Date(insumo.fechaCompra).toISOString().substring(0, 10)

        if (fechaCompra !== fechaCompraInsumo) {
            if (fechaCompraInsumo instanceof Date && !isNaN(fechaCompraInsumo)) return res.json({ msg: 'La fecha de compra no es valida' })

            const timestamp = Date.now();
            const fechaActual = new Date(timestamp).toISOString().substring(0, 10)
            if (fechaActual < fechaCompraInsumo) return res.json({ msg: 'la fecha de compra no puede ser mayor al dia de hoy' })
            set.push("fechaCompra = '" + fechaCompraInsumo + "' ")
        }

        if (!data.marcaId.includes('--')) {
            const idMarca = parseInt(data.marcaId.split('-')[1])
            if (idMarca !== insumo.marca) {
                if (isNaN(parseInt(idMarca))) return res.json({ msg: 'Debe escoger un marca valida' })
                const marca = await consultaconfi('SELECT id FROM marca_activos WHERE estado = 1')
                if (!marca.some(element => element.id === idMarca)) return res.json({ msg: 'Debe escoger un marca valida del listado' })
                set.push('marca = ' + idMarca)
            }
        }

        if (!data.proveedorId.includes('--')) {
            const idProveedor = parseInt(data.proveedorId.split('-')[1])
            if (idProveedor !== insumo.proveedor) {

                if (isNaN(parseInt(idProveedor))) return res.json({ msg: 'Debe escoger un provvedor valido' })
                const proveedor = await consultaconfi('SELECT id FROM proveedores WHERE estado = 1')
                if (!proveedor.some(element => element.id === idProveedor)) return res.json({ msg: 'Debe escoger un proveedor valido del listado' })
                set.push('proveedor = ' + idProveedor + ' ')
            }
        }

        if (set.length == 0) return res.json({ msg: 'No hay datos por actualizar' })
        const actualizar = await actualizarInsumoBd(set, insumo.id)
        if (actualizar.msg) res.json(actualizar)

        res.json({ exito: 'El insumo ha sido actualizado correctamente' })


    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible actualizar el Insumo' })

    }

}

const eliminarFactInsumo = async (req, res) => {

    try {

        const { permisos } = req
        if (permisos.indexOf(9) == -1) return res.json({ msg: 'Usted no no tiene permiso para eliminar la imagen del Insumo' })

        const data = req.body

        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })

        const insumo = await datosValidarInsumo(idInsumo)

        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })

        if (insumo.FacturaPdf == null && insumo.FacturaPdf == '' && insumo.FacturaPdf == undefined) return res.json({ msg: 'El insumo no tiene factura para eliminar, favor recargue e intentelo mas tarde' })

        if (insumo.FacturaPdf !== data.nombre) return res.json({ msg: 'Los datos de la factura del insumo no coinciden, recargue y vuelva a intentarlo' })

        const imagenInsumobd = await actualizarFacturaInsumo(insumo.id, '')
        if (imagenInsumobd.msg) return res.json({ msg: 'No fue posible eliminar la factura del insumo de la base de datos' })

        const eliminarImagen = await elimnarFactInsumo(insumo.FacturaPdf, insumo.id, 4)
        if (eliminarImagen.msg) return res.json({ msg: 'No fue posible eliminar la factura del insumo en el servidor' })

        res.json(eliminarImagen)


    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible eliminar la factura' })

    }


}

const descargarFactInsumo = async (req, res) => {

    try {
        const data = req.body

        if (data.insumo !== data.idInsumo) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })
        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })
        const insumo = await datosValidarInsumo(idInsumo)
        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })

        if (insumo.FacturaPdf !== null && insumo.FacturaPdf !== '' && insumo.FacturaPdf !== undefined) {
            insumo.bufferFactura = await bufferfacturaInsumo(insumo.id, insumo.FacturaPdf)
        } else {
            return res.json({ msg: 'El insumo no tiene factura asociada' })
        }

        res.json({ facturaInsumo: insumo.bufferFactura, nombre: insumo.FacturaPdf })


    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible guardar la factura' })

    }

}

const eliminarImagInsumo = async (req, res) => {

    try {

        const { permisos } = req
        if (permisos.indexOf(9) == -1) return res.json({ msg: 'Usted no no tiene permiso para eliminar la imagen del Insumo' })

        const data = req.body

        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })

        const insumo = await datosValidarInsumo(idInsumo)

        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })

        if (insumo.imagen == null && insumo.imagen == '' && insumo.imagen == undefined) return res.json({ msg: 'el insumo no tiene imagenes a eliminar, favor recargue e intentelo mas tarde' })

        if (insumo.imagen !== data.nombre.split('-')[1]) return res.json({ msg: 'Los datos de la imagen del insumo no coinciden, recargue y vuelva a intentarlo' })

        const imagenInsumobd = await actualizarImagenInsumo(insumo.id, '')
        if (imagenInsumobd.msg) return res.json({ msg: 'No fue posible eliminar la imagen del insumo de la base de datos' })

        const eliminarImagen = await eliminarImagenes(insumo.imagen, insumo.id, 4)
        if (eliminarImagen.msg) return res.json({ msg: 'No fue posible eliminar la imagen del insumo en el servidor' })

        res.json(eliminarImagen)


    } catch (err) {
        console.log(err)
        res.json({ msg: 'No fue posible eliminar la imagen' })

    }

}

export {
    listadoInsumosBodega,
    consultarUnInsumo,
    ingresoInicalInsumo,
    movimientoInsumoBodega,
    actualizarFactInsumo,
    guardarImagInsumo,
    actualizarInsumo,
    eliminarFactInsumo,
    descargarFactInsumo,
    eliminarImagInsumo,
    consultartablasInsumo
}


const validarPalabras = dato => {

    if (dato.includes('select') || dato.includes('Select') || dato.includes('SELECT') || dato.includes('FROM') || dato.includes('From') || dato.includes('from') || dato.includes('insert') || dato.includes('Insert') || dato.includes('INSERT') || dato.includes('update') || dato.includes('UPDATE') || dato.includes('WHERE') || dato.includes('where')) {
        return true
    }
    return false
}