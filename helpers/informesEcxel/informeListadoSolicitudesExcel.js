import * as XLSX from 'xlsx'
import { consultaconfi } from "../../db/sqlConfig.js"
import { sqlInformeListadoSolicitud } from "../../db/sqlInformes.js"


const informeListadoSolicitudesExcel = async data => {

    let fechaInicio
    let fechaFin
    if (data.fechaInicialSolicitud == '' && data.fechaFinalSolicitud == '') {
        const fechaActual = new Date()
        fechaFin = fechaActual.toISOString().substring(0, 10)
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
        const fin = new Date(data.fechaInicialSolicitud)
        if (inicio > fin) return res.json({ msg: 'La fecha de inicio no puede ser mayor a la fecha final' })
        // Calcula la diferencia en meses
        const diferenciaEnMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth())
        if (diferenciaEnMeses > 12) return res.json({ msg: 'El rango de fechas supera los doce (12) meses' })

        fechaInicio = data.fechaInicialSolicitud
        fechaFin = data.fechaFinalSolicitud
    }

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

    const listadoSolicitudes = await sqlInformeListadoSolicitud(condicion)

    if (listadoSolicitudes.msg) return res.json({ msg: 'No fue posible realizar la consulta' })
    if (listadoSolicitudes.length === 0) return res.json({ msg: 'La consulta bajo estos filtros no arrojo resultado modifiquelos e intente de nuevo' })

    const informeSolicitudes = listadoSolicitudes.map((element, index) => {

        return [
            index + 1,
            element.id,
            element.codigoInterno,
            element.nombreActivo,
            element.marca,
            element.modelo,
            element.serie,
            element.ubicacion,
            element.solicitante,
            element.estado,
            element.fecha_solicitud.toISOString().substring(0, 10),
            element.solicitud,
        ]

    })


    // creamos la hoja de calculo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([])
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }]
    // agregamos los datos a la hoja23
    const titulos = [['#', 'Id Solicitud', ' Codigo Interno Activo', ' Activo', 'Marca', 'Modelo', 'Serie', 'Ubicacion', 'Solicitante', 'Estado Reporte', 'Fecha Solicitud', 'Solicitud']]
    XLSX.utils.sheet_add_aoa(worksheet, [['INFORME LISTADO SOLICITUDES DEL PERIODO ' + fechaInicio + ' AL ' + fechaFin]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(worksheet, titulos, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(worksheet, informeSolicitudes, { origin: 'A3' })
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes')
    //Guarda el libro de Excel en un búfer en formato XLSX

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    //Convierte el buffer en una cadena base64
    const base64Data = Buffer.from(buffer).toString('base64');

    return base64Data;
}

export { informeListadoSolicitudesExcel }