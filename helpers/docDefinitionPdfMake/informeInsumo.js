import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

const ddInformeInsumos = async data => {

    pdfMake.vfs = vfsFonts.pdfMake.vfs;
    const dd = {
        pageOrientation: 'landscape',
        pageMargins: [40, 30, 40, 30],
        content: [
            {
                margin: [20, 0, 20, 0],
                text: 'INSUMO',
                alignment: 'center',
                fontSize: 12,
                bold: true
            },

            {
                style: 'tableBodyData',
                table: {
                    widths: [200, '*', '*', '*',],
                    body: [
                        [
                            { rowSpan: 10, image: data.insumo.bufferImagen, width: 200, margin: [0, 26, 0, 0] },
                            { text: 'Insumo', bold: true },
                            { text: 'marca', bold: true },
                            { text: 'N° Factura', bold: true },
                        ],

                        [
                            '',
                            data.insumo.nombre,
                            data.insumo.marca,
                            data.insumo.factura,
                        ],

                        [
                            '',
                            { text: 'Modelo', bold: true },
                            { text: 'Serie', bold: true },
                            { text: 'Fecha Compra', bold: true },
                        ],

                        [
                            '',
                            data.insumo.modelo,
                            data.insumo.serie,
                            data.insumo.fechaCompra.toISOString().slice(0, 10),
                        ],

                        [
                            '',
                            { text: 'Bodega ', bold: true },
                            { text: 'Cantidad Actual', bold: true },
                            { text: 'Costo Unitario', bold: true },
                        ],
                        [
                            '',
                            data.insumo.bodega,
                            data.insumo.cantidad,
                            data.insumo.costo_Unitario,
                        ],

                        [
                            '',
                            { colSpan: 3, text: 'Proveedor', bold: true, alignment: 'center' },
                            '',
                            ''
                        ],

                        [
                            '',
                            { colSpan: 3, text: data.insumo.proveedor },
                            '',
                            ''
                        ],
                        [
                            '',
                            {colSpan: 3,text:'Descripcion', bold: true, alignment: 'center'},
                            '',
                            ''
                        ],
                        
                        [
                            '',
                            { colSpan: 3, text: data.insumo.descripcion },
                            '',
                            ''
                        ],
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return 0; // eliminar borde superior e inferior
                    },
                    vLineWidth: function (i, node) {
                        return 0; // eliminar bordes verticales
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        if (columnIndex !== 0) {
                            return (rowIndex % 2 === 0) ? '#dddddd' : null;
                        }
                        if (rowIndex > 8) {
                            return (rowIndex % 2 === 0) ? '#dddddd' : null;
                        }
                    },

                }
            },

            {
                margin: [20, 20, 20, 0],
                text: 'MOVIMIENTOS:',
                alignment: 'center',
                fontSize: 12,
                bold: true
            },

            {
                style: 'tableBodyData',
                table: {
                    widths: [30, 40, 60, 50, 50, 50, 50, 100, 100, 75, '*'],
                    body: data.bodyMovimientos
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return 0; // eliminar borde superior e inferior
                    },
                    vLineWidth: function (i, node) {
                        return 0; // eliminar bordes verticales
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return (rowIndex % 2 !== 0) ? '#dddddd' : null;
                    },
                }
            },

        ],
        styles: {
            tableHeader: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
                margin: [40, 40, 40, 0]
            },
            tableBodyData: {
                fontSize: 10,
                margin: [0, 20, 0, 0],
                alignment: 'center',
            },
        }

    }

    return dd
}


export { ddInformeInsumos }