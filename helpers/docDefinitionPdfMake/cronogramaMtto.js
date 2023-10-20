import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

const ddcronogramaMtto = async data => {
    pdfMake.vfs = vfsFonts.pdfMake.vfs;
    const dd = {
        pageSize: 'LEGAL',
        pageOrientation: 'landscape',
        pageMargins: [40, 80, 20, 40],

        content: data.content,
        
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
                                { text: 'CRONOGRAMA DE MANTENIMIENTO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
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
            textheader: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
            },

            textbodymonth: {
                fontSize: 10,
                alignment: 'center',
            },


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
                fontSize: 10,
                alignment: 'justify',
                margin: [0, 0, 0, 0]
            },
            title: {
                bold: true,
                fontSize: 18,
                color: 'black',
                margin: [0, 20, 0, 25],
                alignment: 'center'
            }

        },
        defaultStyle: {
            // alignment: 'justify'
        }

    }

    return dd
}


export { ddcronogramaMtto }