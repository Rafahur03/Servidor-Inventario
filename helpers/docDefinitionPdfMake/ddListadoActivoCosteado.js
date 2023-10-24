import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

const ddListadoActivoCosteado = async data => {
    pdfMake.vfs = vfsFonts.pdfMake.vfs;
    const dd = {
        pageSize: 'LEGAL',
        pageOrientation: 'landscape',
        pageMargins: [20, 80, 20, 20],

        content:data.content,
        
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
                                { text: 'F-IN-02', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
                            ],
                            [
                                '',
                                { text: 'CLINICA OFTALMOLOGICA DE SINCELEJO LTDA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 'VERSION', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                                { text: 3, borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }],
                            [
                                '',
                                { text: 'INFORME LISTADO EQUIPOS COSTEADO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
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
            header: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
            },
            tableHeader: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
                margin: [40, 15, 40, 0]
            },
            table: {
                fontSize: 9.5,
                alignment: 'justify',
                margin: [0, 0, 0, 0]
            },
            title: {
                bold: true,
                fontSize: 13,
                color: 'black',
                margin: [0, 10, 0, 5],
                alignment: 'center'
            }
        },
        defaultStyle: {
            // alignment: 'justify'
        }
    }
    return dd
}


export { ddListadoActivoCosteado }