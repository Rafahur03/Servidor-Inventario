import * as XLSX from 'xlsx'
import { consultaconfi } from "../../db/sqlConfig.js"
import { sqlInformeListadoReportes } from "../../db/sqlInformes.js"


const informeListadoReportesExcel = async data => {
    // consultamos los datos del reporte,

    let fechaInicio
    let fechaFin
    if (data.fechaInicialReporte == '' && data.fechaFinalReporte == '') {
        const fechaActual = new Date()
        fechaFin = fechaActual.toISOString().substring(0, 10)
        fechaActual.setMonth(fechaActual.getMonth() - 12)
        fechaInicio = fechaActual.toISOString().substring(0, 10)
    } else if (data.fechaInicialReporte == '') {
        fechaFin = data.fechaFinalReporte
        const fin = new Date(data.fechaFinalReporte)
        fin.setMonth(fin.getMonth() - 12)
        fechaInicio = fin.toISOString().substring(0, 10)
    } else if (data.fechaFinalReporte == '') {
        fechaInicio = data.fechaInicialReporte
        const inicio = new Date(data.fechaInicialReporte)
        inicio.setMonth(inicio.getMonth() + 12)
        fechaFin = inicio.toISOString().substring(0, 10)
    } else {
        const inicio = new Date(data.fechaInicialReporte)
        const fin = new Date(data.fechaInicialReporte)
        if (inicio > fin) return res.json({ msg: 'La fecha de inicio no puede ser mayor a la fecha final' })
        // Calcula la diferencia en meses
        const diferenciaEnMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth())
        if (diferenciaEnMeses > 12) return res.json({ msg: 'El rango de fechas supera los doce (12) meses' })

        fechaInicio = data.fechaInicialReporte
        fechaFin = data.fechaFinalReporte
    }


    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')
    if (clasificacion.msg) return res.json({ msg: 'No fue posible validar la consulta' })
    //filtramos las siglas que tengan valor true
    const filtrosSiglas = data.filtros.filter(element => element.valor)
    // validamos que los filtros con valor true correspondan a una clasificacon activo valida
    const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
    if (filtros.length == 0) return res.json({ msg: 'Debe seleccionar un filtro valido' })


    let condicion = "WHERE (sm.id_estado <> 4 AND rm.fechareporte >= '" + fechaInicio + "' AND rm.fechareporte <= '" + fechaFin + "' AND("

    filtros.forEach((element, index) => {
        if (index === 0) {
            condicion = condicion + ' la.clasificacion_id = ' + element.id
        } else {
            condicion = condicion + ' OR la.clasificacion_id = ' + element.id
        }

    })

    condicion = condicion + ')) \nORDER BY fechareporte DESC;'

    const listadoReportes = await sqlInformeListadoReportes(condicion)
    if (listadoReportes.msg) return res.json({ msg: 'No fue posible realizar la consulta' })

    if (listadoReportes.length === 0) return res.json({ msg: 'La consulta bajo estos filtros no arrojo resultado modifiquelos e intente de nuevo' })

    const informeReportes = listadoReportes.map((element, index) => {

        return [
            index + 1,
            element.idReporte,
            element.idSolicitud,
            element.codigoInterno,
            element.nombreACtivo,
            element.marca,
            element.modelo,
            element.serie,
            element.ubicacion,
            element.solicitante,
            element.proveedor,
            element.realizo,
            element.recibido,
            element.estado,
            element.fecha_solicitud.toISOString().substring(0, 10),
            element.fechareporte.toISOString().substring(0, 10),
            element.fechaCierre === null ? '' : element.fechaCierre.toISOString().substring(0, 10),
            element.solicitud,
            element.hallazgos,
            element.reporte,
            element.recomendaciones,
            element.costo_mo,
            element.costo_mp,

        ]

    })


    // creamos la hoja de calculo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([])
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 22 } }]
    // agregamos los datos a la hoja23
    const titulos = [['#', 'Id Reporte', 'Id Solicitud', ' Codigo Interno Activo', ' Activo', 'Marca', 'Modelo', 'Serie', 'Ubicacion', 'Solicitante', 'Proveedor Mantenimiento', 'Realizo el Soporte', 'Visto Bueno Soporte', 'Estado Reporte', 'Fecha Solicitud', 'Fecha del Reporte', 'Fecha de Cierre', 'Solicitud', 'Hallazgo', 'Reporte', 'Recomendacion', 'Costo Mano de Obra', 'Costo Materiales',]]
    XLSX.utils.sheet_add_aoa(worksheet, [['INFORME LISTADO REPORTES DEL PERIODO ' + fechaInicio + ' AL ' + fechaFin]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(worksheet, titulos, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(worksheet, informeReportes, { origin: 'A3' })
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes')
    //Guarda el libro de Excel en un búfer en formato XLSX

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    //Convierte el buffer en una cadena base64
    const base64Data = Buffer.from(buffer).toString('base64');

    return base64Data;
}

export { informeListadoReportesExcel }