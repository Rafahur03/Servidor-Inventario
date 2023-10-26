import * as XLSX from 'xlsx'
import { consultaconfi } from "../../db/sqlConfig.js"
import { sqlCronogramaManteniento } from "../../db/sqlInformes.js"


const cronogramaMttoExcel = async data => {
    // consultamos los datos del reporte,
    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')

    const todos = data.filtros.some(element => element.id === 'TD' && element.valor === true)
    let condicion = 'WHERE (la.estado_id = 1'

    if (!todos) {
        const filtrosSiglas = data.filtros.filter(element => element.valor)
        const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
        if (filtros.length == 0) return res.json({ msg: 'Debe seleccionar un filtro valido' })
        filtros.forEach((element, index) => {
            if (index == 0) {
                condicion = condicion + ' AND la.clasificacion_id = ' + element.id
            } else {
                condicion = condicion + ' OR la.clasificacion_id = ' + element.id
            }
        });

    }

    condicion = condicion + ') \nORDER BY la.clasificacion_id ASC, codigo;'
    const datos = await sqlCronogramaManteniento(condicion)
    if (datos.msg) return res.json({ msg: 'No fue posible consultar los datos' })

    // Crear un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    let worksheet

    let cronograma = []
    const mergeConfigs = []
    for (let i = 0; i <= 7; i++) {
        mergeConfigs.push({ s: { r: 0, c: i }, e: { r: 1, c: i } })
    }
    mergeConfigs.push({ s: { r: 0, c: 8 }, e: { r: 0, c: 19 } })
    let consecutivo = 1
    datos.forEach((element, index) => {

        if (element.dias === 0) {
            cronograma.push(
                [
                    consecutivo++,
                    element.codigo,
                    element.nombre,
                    element.marca,
                    element.modelo,
                    element.serie,
                    element.ubicacion,
                    element.proveedor,
                    'No Aplica'
                ]
            )

        } else {

            let fechapivote = null
            if (element.fechareporte !== null) {
                fechapivote = element.fechareporte.toISOString().substring(0, 10);
            } else if (element.fecha_proximo_mtto !== null && element.fecha_proximo_mtto.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.fecha_proximo_mtto.toISOString().substring(0, 10);
            } else if (element.vencimiento_garantia !== null && element.vencimiento_garantia.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.vencimiento_garantia.toISOString().substring(0, 10);
            } else if (element.fecha_compra !== null && element.fecha_compra.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.fecha_compra.toISOString().substring(0, 10);
            } else if (element.fecha_creacion !== null && element.fecha_creacion.toISOString() !== '1900-01-01T00:00:00.000Z') {
                fechapivote = element.fecha_creacion.toISOString().substring(0, 10);
            }

            fechapivote = new Date(fechapivote)
            const fechaInicio = new Date(fechapivote)
            if (fechapivote.getFullYear() === parseInt(data.year)) {

                do {
                    fechaInicio.setDate(fechaInicio.getDate() - element.dias)
                } while (fechaInicio.getFullYear() === parseInt(data.year))

                fechaInicio.setDate(fechaInicio.getDate() + element.dias)

            } else if (fechapivote.getFullYear() < parseInt(data.year)) {
                do {
                    fechaInicio.setDate(fechaInicio.getDate() + element.dias)
                } while (fechaInicio.getFullYear() !== parseInt(data.year))

            } else if (fechapivote.getFullYear() > parseInt(data.year)) {

                do {
                    fechaInicio.setDate(fechaInicio.getDate() - element.dias)
                } while (fechaInicio.getFullYear() >= parseInt(data.year))

                fechaInicio.setDate(fechaInicio.getDate() + element.dias)
            }

            let fechas = []

            for (let i = 0; i < 12; i++) {
                if (fechaInicio.getMonth() === i && fechaInicio.getFullYear() === parseInt(data.year)) {
                    fechas[i] = fechaInicio.getDate()
                    fechaInicio.setDate(fechaInicio.getDate() + element.dias)
                } else {
                    fechas[i] = ''
                }
            }

            cronograma.push(
                [
                    consecutivo++,
                    element.codigo,
                    element.nombre,
                    element.marca,
                    element.modelo,
                    element.serie,
                    element.ubicacion,
                    element.proveedor
                ].concat(fechas)
            )
        }


        let ingresardatos = false

        if (datos.length === index + 1) {
            ingresardatos = true
        } else if (datos[index + 1].idSigla !== element.idSigla) {
            ingresardatos = true
        }

        if (ingresardatos) {
        
            // creamos la hoja de calculo
            worksheet = XLSX.utils.aoa_to_sheet([])
            worksheet['!merges'] = mergeConfigs
            // agregamos los datos a la hoja
            const titulos = [['#', 'Codigo', ' Activo', 'Marca', 'Modelo', 'Serie', 'Ubicacion', ' Proveedor Mantenimiento', 'Cronograma Mantenimiento ' + data.year + ' de ' + element.clasificacion + ' "' + element.siglas + '"']]
            XLSX.utils.sheet_add_aoa(worksheet, titulos, { origin: 'A1' })
            const meses = [['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']]
            XLSX.utils.sheet_add_aoa(worksheet, meses, { origin: 'I2' })   
            XLSX.utils.sheet_add_aoa(worksheet, cronograma, { origin: 'A3' })
            XLSX.utils.book_append_sheet(workbook, worksheet, element.siglas)

            cronograma = []
            consecutivo=1
        }
        //Guarda el libro de Excel en un búfer en formato XLSX

    })

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    //Convierte el buffer en una cadena base64
    const base64Data = Buffer.from(buffer).toString('base64');

    return base64Data;
}

export { cronogramaMttoExcel }