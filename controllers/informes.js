import { crearPdfMake } from "../helpers/crearPdfMake.js"
import { consultarCodigoInterno } from "../db/sqlActivos.js"
import { cronogramaMttoExcel } from "../helpers/informesEcxel/cronogramaMttoExcel.js"
import { listadoActivoCosteadoExcel } from "../helpers/informesEcxel/listadoActivoCosteadoExcel.js"
import { listadoActivoExcel } from "../helpers/informesEcxel/listadoActivoExcel.js"
import { validarFecha } from "../helpers/validarfechas.js"
import { informeListadoReportesExcel } from "../helpers/informesEcxel/informeListadoReportesExcel.js"
import { informeListadoSolicitudesExcel } from "../helpers/informesEcxel/informeListadoSolicitudesExcel.js"
const descargaCronograma = async (req, res) => {

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

}
const informelistadoAct = async (req, res) => {
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
}

const informelistadoActCost = async (req, res) => {

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
}
const descargarIfoActCosteado = async (req, res) => {

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

}

const informelistadoReportes = async (req, res) => {
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
    if(reporte === undefined) return res.json({ msg: 'no se pudo procesar el reporte intentelo mas tarde'})
    if(reporte.msg) return res.json(reporte)

    res.json({
        reportePDF: reporte,
        nombre: 'Informe De Reportes Mantenimiento.xlsx'
    })

}

const informelistadoSolicitudes = async (req, res) => {

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
    if(reporte === undefined) return res.json({ msg: 'no se pudo procesar el reporte intentelo mas tarde'})
    if(reporte.msg) return res.json(reporte)
    

    res.json({
        reportePDF: reporte,
        nombre: 'Informe De Solicitudes Mantenimiento.xlsx'
    })
}




export {
    descargaCronograma,
    informelistadoAct,
    informelistadoActCost,
    descargarIfoActCosteado,
    informelistadoReportes,
    informelistadoSolicitudes,
}