// playground requires you to assign document definition to a variable called dd
import fs from 'fs'
import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'
const imageData = fs.readFileSync('C:\\Users\\USER\\Pictures\\COS.png');
const imageDataURLprueba = `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`;


const ddReporte = async (data) => {
    pdfMake.vfs = vfsFonts.pdfMake.vfs;
    // playground requires you to assign document definition to a variable called dd
    const dd = {
        pageSize: 'LETTER',
        pageMargins: [40, 83, 40, 40],
        content: [

            {
                style: 'tableBodyData',
                table: {
                    widths: [55, 55, 50, '*', 56, '*', 50.5, '*'],
                    body: [
                        [
                            {
                                rowSpan: 4,
                                colSpan: 2,
                                image: data.url_img,
                                width: 110,
                                height: 110,
                            },
                            '',
                            { text: 'Nombre:', bold: true },
                            { colSpan: 2, text: data.nombre },
                            '',
                            { text: 'Tipo Activo:', bold: true },
                            { text: 'Medico: ' + data.biomedico, bold: true },
                            { text: 'Apoyo:' + data.apoyo, bold: true },


                        ],
                        [
                            '',
                            '',
                            { text: 'Codigo:', bold: true },
                            data.codigo,
                            { text: 'Ubicacion:', bold: true },
                            data.ubicacion,
                            { text: 'Proceso:', bold: true },
                            { text: data.proceso },

                        ],
                        [
                            '',
                            '',
                            { text: 'Marca:', bold: true, },
                            data.marca,
                            { text: 'Area:', bold: true },
                            data.area,
                            { text: 'Responsable:', bold: true },
                            { text: data.responsable },

                        ],
                        [
                            '',
                            '',
                            { text: 'Modelo:', bold: true },
                            data.modelo,
                            { text: 'Proveedor:', bold: true },
                            { colSpan: 3, text: data.proveedor },
                            '',
                            '',

                        ],
                        [
                            { text: 'Id Activo:', bold: true, fillColor: '#dddddd' },
                            data.idActivo,
                            { text: 'Serie:', bold: true },
                            { text: data.serie },
                            { text: 'Frecuencia de Mtto:', bold: true },
                            data.frecuencia,
                            { text: 'Estado', bold: true },
                            { text: data.estado },

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
                        if (rowIndex >= 5) {
                            return (rowIndex % 2 === 0) ? '#dddddd' : null;
                        }
                    },

                }
            },
            {
                style: 'tableBodyData',
                table: {
                    widths: [49, 35, 60, 55, '*', 35, '*', 35, 35, 35],
                    body: [
                        [
                            {
                                colSpan: 10,
                                text: 'DATOS DEL REPORTE:',
                                fontSize: 13,
                                bold: true
                            },

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
                            { text: 'Reporte:', bold: true },
                            { text: data.idReporte, bold: true, color: 'red' },
                            { text: 'Fecha Mtto', bold: true },
                            { text: data.fechaReporte },
                            { text: 'Solicitud:', bold: true, },
                            { text: data.idSolicitud, color: 'red' },
                            { text: 'Tipo Mtto', bold: true },
                            { text: 'Pre: ' + data.perventivo, bold: true },
                            { text: 'Cor: ' + data.correctivo, bold: true },
                            { text: 'Pred: ' + data.Predictivo, bold: true },
                        ],
                        [
                            { text: 'MO: ', bold: true },
                            { colSpan: 2, text: data.mo },
                            '',
                            { text: 'MP: ', bold: true },
                            data.mp,
                            { colSpan: 2, text: 'Proximo Mtto:', bold: true },
                            '',
                            { colSpan: 2, text: data.proximoMtto },
                            '',
                            ''



                        ],
                        [
                            { text: 'Proveedor:', bold: true },
                            { colSpan: 4, text: data.proveedor },
                            '',
                            '',
                            '',
                            { colSpan: 2, text: 'Estado: ', bold: true },
                            '',
                            { colSpan: 2, text: data.estadoSolicitud },
                            '',
                            '',


                        ],
                        [
                            {
                                colSpan: 10,
                                text: 'Descripcion De La Solicitud:',
                                bold: true
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: data.solicitud,
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: 'Hallazgos',
                                bold: true
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: data.hallazgos,
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: 'Reporte Tecnico',
                                bold: true
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: data.reporte,
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: 'Recomendaciones',
                                bold: true
                            },
                        ],
                        [
                            {
                                colSpan: 10,
                                text: data.recomendaciones,
                            },
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
                        return (rowIndex % 2 !== 0) ? '#dddddd' : null;

                    },

                }
            },
            {
                style: 'tableBodyImagenes',
                table: {
                    widths: [124.7, 124.7, 124.7, 124.7],
                    body: [
                        data.img_reporte,
                    ]

                },
                layout: 'noBorders'
            },
            {
                style: 'tableBodyImagenes',
                table: {
                    widths: ['*', '*'],
                    body: [
                        [
                            {
                                image: data.firmaReporte,
                                fit: [50, 50]
                            },
                            {
                                image: data.frimaAprobado,
                                fit: [50, 50]

                            },
                        ],
                        [
                            {
                                text: data.usuarioReporte,
                                bold: true
                            },
                            {
                                text: data.usuarioAprobado,
                                bold: true
                            },
                        ],
                        [
                            {
                                text: 'Realizo El Mtto',
                                bold: true
                            },
                            {
                                text: 'Recibio el soporte',
                                bold: true
                            },
                        ],
                    ]

                },
                layout: 'noBorders'
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
                                { rowSpan: 3, image: imageDataURLprueba, fit: [60, 30], margin: [3, 7, 0, 0], borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'SISTEMA DE GESTION INTEGRAL', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'CODIGO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'F-IN-01', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
                            ],
                            [
                                '',
                                { text: 'CLINICA OFTALMOLOGICA DE SINCELEJO LTDA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'VERSION', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 0, borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }],
                            [
                                '',
                                { text: 'REPORTE TECNICO DE MANTENIMIENTO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
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
                fontSize: 10,
                bold: true,
                alignment: 'center',
                margin: [40, 20, 40, 0]
            },
            tableBodyData: {
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'center',
            },
            tableBodyImagenes: {
                fontSize: 10,
                margin: [0, 7, 0, 3],
                alignment: 'center',
            }
        },

    }
    return dd
}
export { ddReporte }