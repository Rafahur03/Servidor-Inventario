import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

const ddInformeActivo = async data => {
    pdfMake.vfs = vfsFonts.pdfMake.vfs;
    const dd = {
        pageSize: 'LETTER',
        pageOrientation: 'landscape',
        pageMargins: [40, 103, 40, 40],
        content: [

            {
                style: 'tableBodyData',
                table: {
                    widths: [150, 41, '*', 48, '*', 60.5, 5, '*', 5, 60.5, '*'],
                    body: [
                        [
                            { rowSpan: 5, image: data.url_img, width: 140, height: 140, margin: [2, 0, 6, 0] },
                            { text: 'Nombre:', bold: true },
                            { colSpan: 2, text: data.nombre },
                            '',
                            { text: 'Tipo Activo:', bold: true },
                            { text: 'Medico: ' + data.biomedico, bold: true },
                            '',
                            { text: 'Apoyo: ' + data.apoyo, bold: true },
                            '',
                            { text: 'Codigo:', bold: true },
                            data.codigo
                        ],
                        [
                            '',
                            { text: 'Marca:', bold: true, },
                            data.marca,
                            { text: 'Ubicacion:', bold: true },
                            data.ubicacion,
                            { text: 'Proceso:', bold: true },
                            { colSpan: 3, text: data.proceso },
                            '',
                            '',
                            { text: 'Riesgo', bold: true },
                            data.riesgo,
                        ],
                        [
                            '',
                            { text: 'Modelo:', bold: true },
                            data.modelo,
                            { text: 'Area:', bold: true },
                            data.area,
                            { text: 'Responsable:', bold: true },
                            { colSpan: 3, text: data.responsable },
                            '',
                            '',
                            { text: 'Frecuencia de Mtto:', bold: true },
                            data.frecuencia,
                        ],
                        [
                            '',
                            { text: 'Serie:', bold: true },
                            { text: data.serie },
                            { text: 'Fecha De Compra:', bold: true },
                            data.fechaCompra,
                            { text: 'Proveedor:', bold: true },
                            { colSpan: 3, text: data.proveedor },
                            '',
                            '',
                            { text: 'Estado', bold: true },
                            data.estado,
                        ],
                        [
                            '',
                            { text: 'Garantia:', bold: true },
                            { text: data.garantia },
                            { text: 'Factura:', bold: true },
                            data.factura,
                            { text: 'Valor:', bold: true },
                            { colSpan: 2, text: data.valor },
                            '',
                            { colSpan: 2, text: 'Fecha Ingreso', bold: true },
                            '',
                            data.ingreso,
                        ],
                        [
                            { text: 'Id:  ' + data.id, bold: true, alignment: 'center', color: 'red' },
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                        ],
                        [
                            { colSpan: 11, text: 'Descripcion:', bold: true },
                        ],
                        [
                            { colSpan: 11, text: data.descripcion },
                        ],
                        [
                            { colSpan: 11, text: 'Recomendaciones:', bold: true },
                        ],
                        [
                            { colSpan: 11, text: data.recomendaciones },
                        ],
                        [
                            { colSpan: 11, text: 'Observacciones:', bold: true },
                        ],
                        [
                            { colSpan: 11, text: data.observacion },
                        ],

                    ],

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
                        if (rowIndex > 5) {
                            return (rowIndex % 2 === 0) ? '#dddddd' : null;
                        }
                    },

                }
            },
            {
                style: 'tableBodyComponentes',
                table: {
                    widths: [150, 120, 121, 150, 125],
                    body: data.componentes
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

            {
                margin: [20, 0, 20, 0],
                text: 'LISTADO DE MANTENIMIENTOS DEL ACTIVO',
                alignment: 'center',
                fontSize: 12,
                bold: true
            },
            {
                style: 'tableBodyData',
                table: {
                    widths: [20, 30, 56, '*', '*', '*', '*', 56, 40, 40],
                    body: data.bodyreportes
                },

                layout: {
                    hLineWidth: function (i, node) {
                        return 0; // eliminar borde superior e inferior
                    },
                    vLineWidth: function (i, node) {
                        return 0; // eliminar bordes verticales
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return (rowIndex % 2 === 0) ? '#dddddd' : null;
                    },
                }
            },


        ],
        header: function (currentPage, pageCount) {
            return [

                {
                    style: 'tableHeader',
                    table: {
                        widths: [70, '*', 50, 50],
                        body: [
                            [
                                { rowSpan: 3, image: data.logo, fit: [60, 30], margin: [3, 7, 0, 0], borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'SISTEMA DE GESTION INTEGRAL', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'CODIGO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'F-IN-', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
                            ],
                            [
                                '',
                                { text: 'CLINICA OFTALMOLOGICA DE SINCELEJO LTDA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'VERSION', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 3, borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }],
                            [
                                '',
                                { text: 'INFORME DE ACTIVO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'PAGINA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: currentPage.toString() + ' DE ' + pageCount.toString(), borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
                            ],
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (2);
                        },
                        vLineWidth: function (i, node) {
                            return 2;
                        },

                    }
                }

            ]

        },
        styles: {
            tableHeader: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
                margin: [40, 40, 40, 0]
            },
            tableBodyData: {
                fontSize: 10,
                margin: [0, 10, 0, 0],
                alignment: 'center',
            },
            tableBodyComponentes: {
                fontSize: 10,
                margin: [0, 5, 0, 0],
                alignment: 'center',
            }
        },

    }

    return dd
}


export { ddInformeActivo }