import * as XLSX from 'xlsx'
import { consultaconfi } from "../../db/sqlConfig.js"
import { sqlListadoActivoCosteado } from "../../db/sqlInformes.js"

const listadoActivoCosteadoExcel = async data => {
    // consultamos los datos del reporte,
    const clasificacion = await consultaconfi('SELECT id, TRIM(siglas) AS siglas FROM clasificacion_activos WHERE estado = 1')

    const todos = data.filtros.some(element => element.id === 'TD' && element.valor === true)
    let condicion

    if (!todos) {
        const filtrosSiglas = data.filtros.filter(element => element.valor)
        const filtros = clasificacion.filter(element => filtrosSiglas.some(item => item.id === element.siglas))
        if (filtros.length == 0) return { msg: 'Debe seleccionar un filtro valido' }

        filtros.forEach((element, index) => {
            if (index === 0) {
                if (data.estado) {
                    condicion = 'WHERE (la.clasificacion_id = ' + element.id
                } else {
                    condicion = 'WHERE (la.estado_id = 1 AND la.clasificacion_id = ' + element.id
                }

            } else {
                condicion = condicion + ' OR la.clasificacion_id = ' + element.id
            }
        });

        if (data.estado) {
            condicion = condicion + ') \nORDER BY la.clasificacion_id DESC, estado_id ASC, codigo;'
        } else {
            condicion = condicion + ') \nORDER BY la.clasificacion_id ASC, codigo;'
        }
    } else {

        if (data.estado) {
            condicion = 'ORDER BY la.clasificacion_id DESC, estado_id ASC, codigo;'
        } else {
            condicion = 'ORDER BY la.clasificacion_id ASC, codigo;'
        }
    }


    const datos = await sqlListadoActivoCosteado(condicion)
    if (datos.msg) return { msg: 'No fue posible consultar los datos' }

    const workbook = XLSX.utils.book_new();
    let worksheet

    let reporte = []

    datos.forEach((element, index) => {
        const costo = parseFloat(element.valor.replace(',', '.'), 2)
        reporte.push(
            [
                index + 1,
                element.codigo,
                element.nombre,
                element.marca,
                element.modelo,
                element.serie,
                element.proceso,
                element.area,
                element.ubicacion,
                element.usuario,
                costo,
                element.totalMo,
                element.totalMp,
                (costo + element.totalMo + element.totalMp),
                element.estado
            ]
        )

        let ingresardatos = false

        if (datos.length === index + 1) {
            ingresardatos = true
        } else if (datos[index + 1].idSigla !== element.idSigla) {
            ingresardatos = true
        }

        if (ingresardatos) {
            reporte.unshift(
                [
                    '#',
                    'Codigo',
                    'Activo',
                    'Marca',
                    'Modelo',
                    'Serie',
                    'Proceso',
                    'Area',
                    'Ubicacion',
                    'Responsable',
                    'Valor',
                    'Valor Mo Mtto',
                    'Valor Mp Mtto',
                    'Total',
                    'Estado'
                ],
            )

            worksheet = XLSX.utils.aoa_to_sheet([])
            worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }]
            //worksheet['A1'].v = 'Listado de ' + element.clasificacion + ' "' + element.siglas + '" costeado '
            // agregamos los datos a la hoja
            XLSX.utils.sheet_add_aoa(worksheet, reporte, { origin: 'A2' })
            XLSX.utils.book_append_sheet(workbook, worksheet, element.siglas)
            reporte = [];
        }
    })

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    //Convierte el buffer en una cadena base64
    const base64Data = Buffer.from(buffer).toString('base64');

    return base64Data;

}

export { listadoActivoCosteadoExcel }