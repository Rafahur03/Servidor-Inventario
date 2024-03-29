import { crearPdfMake } from "../helpers/crearPdfMake.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
import { cronogramaMttoExcel } from "../helpers/informesEcxel/cronogramaMttoExcel.js"
import { listadoActivoCosteadoExcel } from "../helpers/informesEcxel/listadoActivoCosteadoExcel.js"
import { listadoActivoExcel } from "../helpers/informesEcxel/listadoActivoExcel.js"
import { validarFecha } from "../helpers/validarfechas.js"
import { informeListadoReportesExcel } from "../helpers/informesEcxel/informeListadoReportesExcel.js"
import { informeListadoSolicitudesExcel } from "../helpers/informesEcxel/informeListadoSolicitudesExcel.js"
import { datosValidarInsumo } from "../db/sqlInsumos.js"
import { informeInsumoExcel } from "../helpers/informesEcxel/infomeInsumoExcel.js"
const descargaCronograma = async (req, res) => {
    try {
        const { sessionid } = req

        const { data } = req.body

        if (data.tipo != 'pdf' && data.tipo != 'excel') return res.json({ msg: 'No se pudo validar el tipo de archivo seleccionado' })

        for (var i = 0; i < data.filtros.length; i++) {
            if (typeof data.filtros[i].valor !== 'boolean') {
                return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
            }

            if (
                typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) {
                return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
            }
        }

        if (data.filtros.every(item => item.valor === false)) return res.json({ msg: 'Debe escoger una Clasificacion de Activo' })

        if (isNaN(parseInt(data.year))) return res.json({ msg: 'Debe escoger un año de la lista' })
        let cronograma
        if (data.tipo === 'pdf') {
            cronograma = await crearPdfMake(data, 'cronogramaMtto')
        } else if (data.tipo === 'excel') {
            cronograma = await cronogramaMttoExcel(data)
        } else {
            return res.json({ msg: 'No se pudo validar el tipo de archivo seleccionado' })
        }
        if (cronograma === undefined) return res.json({ msg: 'No fue posible crear el reporte' })
        if (cronograma.msg) return res.json({ msg: 'No fue posible crear el reporte' })

        res.json({
            reportePDF: (data.tipo == 'pdf' ? 'data:application/pdf;base64,' + cronograma : cronograma),
            nombre: 'Cronograma ' + data.year + (data.tipo == 'pdf' ? '.pdf' : '.xlsx')
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargar cronograma Mtto ' + data.tipo, ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al Descargar cronograma Mtto' })
        console.log('Descargar cronograma Mtto' + error)

    }

}
const informelistadoAct = async (req, res) => {
    try {
        const { sessionid } = req
        const { data } = req.body
        if (data.tipo != 'pdf' && data.tipo != 'excel') return res.json({ msg: 'No se pudo validar el tipo de archivo seleccionado' })
        for (var i = 0; i < data.filtros.length; i++) {

            if (typeof data.filtros[i].valor !== 'boolean') {
                return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
            }

            if (

                typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) {
                return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
            }
        }

        if (data.filtros.every(item => item.valor === false)) return res.json({ msg: 'Debe escoger una Clasificacion de Activo' })
        if (typeof data.estado !== 'boolean') return { msg: 'Debe escoger un estado valido en el filtro estado' }

        let reporte

        if (data.tipo === 'pdf') {
            reporte = await crearPdfMake(data, 'informelistadoActivo')
        } else if (data.tipo === 'excel') {
            reporte = await listadoActivoExcel(data)
        } else {
            return res.json({ msg: 'No se pudo validar el tipo de archivo seleccionado' })
        }

        if (reporte === undefined) return res.json({ msg: 'No fue posible crear el reporte' })
        if (reporte.msg) return res.json({ msg: 'No fue posible crear el reporte' })


        res.json({
            reportePDF: (data.tipo == 'pdf' ? 'data:application/pdf;base64,' + reporte : reporte),
            nombre: 'Listado Activos' + (data.tipo == 'pdf' ? '.pdf' : '.xlsx')
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargar Listado Activos' + data.tipo, ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al Descargar Listado Activos' })
        console.log('Descargar Listado Activos' + error)

    }
}
const informelistadoActCost = async (req, res) => {
    try {
        const { sessionid } = req
        const { data } = req.body
        if (data.tipo != 'pdf' && data.tipo != 'excel') return res.json({ msg: 'No se pudo validar el tipo de archivo seleccionado' })

        for (var i = 0; i < data.filtros.length; i++) {
            if (typeof data.filtros[i].valor !== 'boolean') {
                return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
            }

            if (
                typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) {
                return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
            }
        }

        if (data.filtros.every(item => item.valor === false)) return res.json({ msg: 'Debe escoger una Clasificacion de Activo' })
        if (typeof data.estado !== 'boolean') return { msg: 'Debe escoger un estado valido en el filtro estado' }

        let reporte

        if (data.tipo === 'pdf') {
            reporte = await crearPdfMake(data, 'listadoActivoCosteado')
        } else if (data.tipo === 'excel') {
            reporte = await listadoActivoCosteadoExcel(data)
        } else {
            return res.json({ msg: 'No se pudo validar el tipo de archivo seleccionado' })
        }

        if (reporte === undefined) return res.json({ msg: 'No fue posible crear el reporte' })
        if (reporte.msg) return res.json({ msg: 'No fue posible crear el reporte' })


        res.json({
            reportePDF: (data.tipo == 'pdf' ? 'data:application/pdf;base64,' + reporte : reporte),
            nombre: 'Listado Activos Costeado' + (data.tipo == 'pdf' ? '.pdf' : '.xlsx')
        })
        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargar Listado Activos Costeado' + data.tipo, ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al Descargar Listado Activos Costeado' })
        console.log('Descargar Listado Activos Costeado' + error)

    }
}
const descargarIfoActCosteado = async (req, res) => {
    try {
        const { sessionid } = req

        const { data } = req.body
        if (parseInt(data.activo.split('-')[1]) == NaN) return res.json({ msg: 'Debe escoger un activo valido' })
        const activo = await consultarCodigoInterno(data.activo.split('-')[1])
        if (activo.msg) return res.json({ msg: 'No se pudo validar el activo' })
        if (data.codigo != activo.codigo) return res.json({ msg: 'Debe escoger un activo valido' })
        let informe = await crearPdfMake(activo.id, 'InformActivoCosteado')
        if (informe.msg) return res.json({ msg: 'No fue posible crear el informe' })

        res.json({
            reportePDF: 'data:application/pdf;base64,' + informe,
            nombre: 'Informe Activo costeado ' + activo.codigo + '.pdf'
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargar Listado Activos Costeado pdf', ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al Descargar Listado Activos Costeado en pdf' })
        console.log('Descargar Listado Activos Costeado pdf' + error)

    }

}

const informelistadoReportes = async (req, res) => {
    try {
        const { sessionid } = req
        const { data } = req.body
        // validamos las fechas
        if (data.fechaInicialReporte != '') {
            if (!validarFecha(data.fechaInicialReporte)) return res.json({ msg: 'La fecha de inicio no es valida' })
            const hoy = new Date()
            const inicio = new Date(data.fechaInicialReporte)
            if (inicio > hoy) return res.json({ msg: 'La fecha de inicio no puede ser mayor al dia de hoy' })
        }
        if (data.fechaFinalReporte != '') {
            if (!validarFecha(data.fechaFinalReporte)) return res.json({ msg: 'La fecha de Final no es valida' })
            const hoy = new Date()
            const fin = new Date(data.fechaFinalReporte)
            if (fin > hoy) return res.json({ msg: 'La fecha de final no puede ser mayor al dia de hoy' })
        }

        for (var i = 0; i < data.filtros.length; i++) {
            if (typeof data.filtros[i].valor !== 'boolean') return res.json({ msg: 'No se pudo validar los filtros seleccionados' });

            if (typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
        }

        if (data.filtros.every(item => item.valor === false)) return res.json({ msg: 'Debe escoger una Clasificacion de Activo' })

        const reporte = await informeListadoReportesExcel(data)
        if (reporte === undefined) return res.json({ msg: 'no se pudo procesar el reporte intentelo mas tarde' })
        if (reporte.msg) return res.json(reporte)

        res.json({
            reportePDF: reporte,
            nombre: 'Informe De Reportes Mantenimiento.xlsx'
        })

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargar Listado Reportes Mantenimiento Excel', ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al Descargar Listado Reportes Mantenimiento Excel' })
        console.log('Descargar Listado Reportes Mantenimiento Excel' + error)

    }

}

const informelistadoSolicitudes = async (req, res) => {
    try {
        const { sessionid } = req

        const { data } = req.body
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

        for (var i = 0; i < data.filtros.length; i++) {
            if (typeof data.filtros[i].valor !== 'boolean') return res.json({ msg: 'No se pudo validar los filtros seleccionados' });

            if (typeof data.filtros[i].id !== 'string' || data.filtros[i].id.trim().length === 0) return res.json({ msg: 'No se pudo validar los filtros seleccionados' });
        }

        if (data.filtros.every(item => item.valor === false)) return res.json({ msg: 'Debe escoger una Clasificacion de Activo' })

        const reporte = await informeListadoSolicitudesExcel(data)
        if (reporte === undefined) return res.json({ msg: 'no se pudo procesar el reporte intentelo mas tarde' })
        if (reporte.msg) return res.json(reporte)


        res.json({
            reportePDF: reporte,
            nombre: 'Informe De Solicitudes Mantenimiento.xlsx'
        })
        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Descargar Listado Solicitudes Mantenimiento Excel', ipAddress)

    } catch (error) {
        res.json({ msg: 'Ha ocurrido un error al Descargar Listado Solicitudes Mantenimiento Excel' })
        console.log('Descargar Listado Solicitudes Mantenimiento Excel' + error)

    }
}

const informeMovimientoInsumos = async (req, res) => {

    

    try {
        const { sessionid } = req
        const { data } = req.body


        const idInsumo = parseInt(data.insumo.split('-')[1])
        if (isNaN(idInsumo)) return res.json({ msg: 'INSUMO NO VALIDO, cargue nuevamente e intente nuevamente' })
        const insumo = await datosValidarInsumo(idInsumo)
        if (insumo == undefined) return res.json({ msg: 'El insumo no existe' })
        if (insumo.msg) return res.json({ msg: 'No es posible validar los datos del insumo' })


        if (data.tipo == 'pdf') {
            const movimientos = await crearPdfMake(insumo.id, 'informeInsumos')
            if (movimientos.msg) return res.json(movimientos)
            res.json({ movimientos: 'data:application/pdf;base64,' + movimientos, nombre: 'Movimiento Insumo Ins-' + insumo.id })
            const ipAddress = req.connection.remoteAddress.split('f:')[1]
            actividadUsuario(sessionid, 'Descargar Listado Movimeinto Insumo pdf '+ insumo.id, ipAddress)
            return
            
        }

        if (data.tipo == 'excel') {
            const movimientos = await informeInsumoExcel(insumo.id)
            if (movimientos === undefined) return res.json({ msg: 'no se pudo procesar el reporte intentelo mas tarde' })
            if (movimientos.msg) return res.json(movimientos)
            res.json({
                movimientos,
                nombre: 'Informe movimiento insumo- Ins-' + insumo.id + '.xlsx'
            })

            const ipAddress = req.connection.remoteAddress.split('f:')[1]
            actividadUsuario(sessionid, 'Descargar Listado Movimeinto Insumo excel '+ insumo.id, ipAddress)

            return
        }

        res.json({ msg: 'El tipo de informe Solicitado no es valido--' })

    } catch (error) {
        console.log(error)
        res.json({ msg: 'No fue posible consultar el informe intentelo mas tarde' })
    }
}



export {
    descargaCronograma,
    informelistadoAct,
    informelistadoActCost,
    descargarIfoActCosteado,
    informelistadoReportes,
    informelistadoSolicitudes,
    informeMovimientoInsumos
}