import * as XLSX from 'xlsx'
import { consultarInformeInsumos } from '../../db/sqlInsumos.js'

const informeInsumoExcel = async id => {
    const consulta = await consultarInformeInsumos(id)
    if (consulta.msg) return { msg: 'No fue posible consultar los datos para el informe solicitado' }
    const insumo = consulta[0][0]
    const movimientos = consulta[1]
    const datosInsumo = [
        ['Insumo', 'Marca', 'Modelo', 'Serie', 'N° Factura'],
        [insumo.nombre, insumo.marca, insumo.modelo, insumo.serie, insumo.factura],
        ['Area', 'Cantidad Actual', 'Costo Unitario', 'Fecha Compra', 'Proveedor'],
        [insumo.bodega, insumo.cantidad, insumo.costo_Unitario, insumo.fechaCompra.toISOString().slice(0, 10), insumo.proveedor]
    ]

    const bodyMovimientos = movimientos.map((element, index) => {
        let total = null

        if (element.tipo == 'Entrada') total = element.cantidadAnterior + element.cantidad

        if (element.tipo == 'Salida') total = element.cantidadAnterior - element.cantidad

        if (element.tipo == 'Arqueo') total = element.cantidad

        return (

            [
                index,
                element.id,
                element.fecha.toISOString().slice(0, 19).replace('T', ' '),
                element.cantidad,
                element.cantidadAnterior,
                total,
                element.tipo,
                element.usuarioDestino,
                element.usuarioResponsable,
                element.bodegaDestino,
                element.descripcionAqueo
            ]
        )
    })

    bodyMovimientos.unshift(
        [
            '#',
            'id Movimiento',
            'Fecha',
            'Cant Movimiento',
            'Cantidad Antetior',
            'Total Insumo',
            'Tipo Movimiento',
            'Usuario Recibido',
            'Usuario Responsable',
            'Bodega Destino/Origen',
            'Observacion',
        ]

    )

    const workbook = XLSX.utils.book_new();
    let worksheet = XLSX.utils.aoa_to_sheet([])
    const mergeConfigs = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 4 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 4 } },
        { s: { r: 8, c: 0 }, e: { r: 8, c: 10 } }

    ]

    worksheet['!merges'] = mergeConfigs
    XLSX.utils.sheet_add_aoa(worksheet, [['INSUMO']], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(worksheet, datosInsumo, { origin: 'A2' })
    XLSX.utils.sheet_add_aoa(worksheet, [['Descripcion']], { origin: 'A6' })
    XLSX.utils.sheet_add_aoa(worksheet, [[insumo.descripcion]], { origin: 'A7' })
    XLSX.utils.sheet_add_aoa(worksheet, [['MOVIMIENTOS']], { origin: 'A9' })
    XLSX.utils.sheet_add_aoa(worksheet, bodyMovimientos, { origin: 'A10' })
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ins-' + insumo.id)
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    //Convierte el buffer en una cadena base64
    const base64Data = Buffer.from(buffer).toString('base64');

    return base64Data;

}

export { informeInsumoExcel }