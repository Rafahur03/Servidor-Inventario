

import {
    consultarListadoInsumosBodega,
    consultarInsumosBodega,
    consultarCantidadInsumo,
    movimientoBodegaInsumos,
    datosValidarInsumo,
    actualizarInsumoBd,
    actualizarImagenInsumo,
    actualizarFacturaInsumo
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
    elimnarFactInsumo
} from "../helpers/copiarCarpetasArchivos.js"

import { enviarCorreo } from "../helpers/eviarEmail.js"
const listadoInsumosBodega = async (req, res) => {
    try {
        const { permisos } = req
        if (permisos.indexOf(7) === -1) return res.json({ msg: 'Usted no tiene permisos para este modulo' })
        const consulta = await consultarListadoInsumosBodega()
        if (consulta.msg) return res.json(consulta)

        res.json(consulta)

    } catch (err) {

        res.json({ msg: 'Error al intentar consultar el listrado de insumos' })

    }

}

const consultarUnInsumo = async (req, res) => {
    await enviarCorreo('hola')
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
        insumo.fechaCompra = insumo.fechaCompra.toISOString().substring(0, 10)
        movimientos.forEach(element => element.fechaMovimiento = element.fechaMovimiento.toISOString().slice(0, 19).replace('T', ' '))
        const data = { insumo, movimientos, usuarios }
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
        if (permisos.indexOf(7) === -1) return res.json({ msg: 'Usted no tiene permisos para realizar esta operacion' })

        const movimiento = req.body
        if (!movimiento.insumo || !movimiento.idInsumno || !movimiento.tipo || !movimiento.cantidad) return res.json({ msg: 'Los datos del insumo estan incompletos' })

        if (movimiento.insumo !== movimiento.idInsumno) return res.json({ msg: 'No es posible validar el insumo' })
        const idInsumo = movimiento.idInsumno.split('-')[1]
        if (isNaN(parseInt(idInsumo))) return res.json({ msg: 'Insumo no Valido' })

        if (isNaN(parseFloat(movimiento.cantidad))) return res.json({ msg: 'La cantidad a mover debe ser numerica' })
        const insumoBd = await consultarCantidadInsumo(idInsumo)
        if (insumoBd.msg) return res.json(insumoBd)

        if (isNaN(parseInt(movimiento.tipo))) return res.json({ msg: 'El tipo de movimiento no es valido' })

        if (movimiento.tipo !== 3) {
            if (!movimiento.usuarioDestino) return ({ msg: 'Debe seleccionar un usuario' })
            const usuarioDestino = movimiento.usuarioDestino.split('-')[1]
            if (isNaN(parseInt(usuarioDestino))) return res.json({ msg: 'El usuario ingresado no es valido' })

            const usuario = await consultarDataUsuario(usuarioDestino)
            if (usuario === undefined) return res.json({ msg: 'El usuario ingresado no existe' })
            if (usuario.msg) return res.json({ msg: 'No fue posible validar el usuario' })

        }

        const fecha = new Date(Date.now())
        fecha.setHours(fecha.getHours() - 5)
        let data = {}
        let cantidadNueva
        switch (movimiento.tipo) {
            case 1:
                cantidadNueva = insumoBd.cantidad + parseFloat((movimiento.cantidad))
                data = {
                    transaccion: movimiento.tipo,
                    cantidad: movimiento.cantidad,
                    usuario: sessionid,
                    idInsumoBodega: idInsumo,
                    usuariodestino: movimiento.usuarioDestino.split('-')[1],
                    fecha: fecha.toISOString().slice(0, 23).replace('T', ' '),
                    cantidadAnterior: insumoBd.cantidad,
                    descripcionAqueo: movimiento.ObservacionesInsumo,
                    cantidadNueva
                }

                break

            case 2:
                cantidadNueva = insumoBd.cantidad - parseFloat((movimiento.cantidad))
                data = {
                    transaccion: movimiento.tipo,
                    cantidad: movimiento.cantidad,
                    usuario: sessionid,
                    idInsumoBodega: idInsumo,
                    usuariodestino: movimiento.usuarioDestino.split('-')[1],
                    fecha: fecha.toISOString().slice(0, 23).replace('T', ' '),
                    cantidadAnterior: insumoBd.cantidad,
                    descripcionAqueo: movimiento.ObservacionesInsumo,
                    cantidadNueva
                }


                break

            case 3:
                cantidadNueva = parseFloat(movimiento.cantidad)
                data = {
                    transaccion: movimiento.tipo,
                    cantidad: movimiento.cantidad,
                    usuario: sessionid,
                    idInsumoBodega: idInsumo,
                    usuariodestino: sessionid,
                    fecha: fecha.toISOString().slice(0, 23).replace('T', ' '),
                    cantidadAnterior: insumoBd.cantidad,
                    descripcionAqueo: movimiento.ObservacionesInsumo,
                    cantidadNueva
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
  
        if (data.insumo !== data.idInsumo) return res.json({ msg: 'Activo invalido. Debe selecionar un activo Valido' })
        const idInsumo = data.idInsumo.split('-')[1]
        if (isNaN(parseInt(idInsumo))) return res.json({ msg: 'Activo invalido. Debe selecionar un activo Valido' })
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

        if (!data.areaId.includes('--')) {
            const idArea = parseInt(data.areaId.split('-')[1])
            if (idArea !== insumo.idArea) {
                if (isNaN(parseInt(idArea))) return res.json({ msg: 'Debe escoger un area valida' })
                const area = await consultaconfi('SELECT id FROM areas WHERE estado = 1')
                if (!area.some(element => element.id === idArea)) return res.json({ msg: 'Debe escoger un area valida del listado' })
                set.push('idArea = ' + idArea)
            }
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
    movimientoInsumoBodega,
    actualizarFactInsumo,
    guardarImagInsumo,
    actualizarInsumo,
    eliminarFactInsumo,
    descargarFactInsumo,
    eliminarImagInsumo
}


const validarPalabras = dato => {

    if (dato.includes('select') || dato.includes('Select') || dato.includes('SELECT') || dato.includes('FROM') || dato.includes('From') || dato.includes('from') || dato.includes('insert') || dato.includes('Insert') || dato.includes('INSERT') || dato.includes('update') || dato.includes('UPDATE') || dato.includes('WHERE') || dato.includes('where')) {
        return true
    }
    return false
}