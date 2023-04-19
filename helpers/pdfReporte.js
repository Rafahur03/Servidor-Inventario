// playground requires you to assign document definition to a variable called dd
const data = {
    idActivo: 1,
    idReporte:25632,
    nombre: 'Maquina Anestesica',
    codigo: 'EM0001',
    marca: 'Mindray',
    modelo: 'WATO EX-20',
    serie: '12255sss',
    apoyo: '',
    biomedico: 'X',
    ubicacion: 'Quirofano',
    responsable: 'Maira Gisela Dominguez Perez',
    usuarioSolicitud: 'Martha Cecilia Bitar Calle',
    estado: 'Dado de baja',
    frecuencia: 'Anual',
    proceso: 'Gestion Administrativa Y Financiera',
    area: 'Admisiones',
    proveedor: 'Clinica Oftalmologica de Sincelejo Ltda',
    idSolicitud: 546,
    fechaSolicitud: '20/05/2023',
    fechaReporte: '20/06/2023',
    fechaCierre: '20/06/2022',
    proximoMtto: '20/06/2024',
    correctivo:'X',
    perventivo:'X',
    mo:25566655,
    mp:5555555,
    solicitud: 'SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSoliSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito citoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito SolicitoSolicitoSolicitoSolicitoSolicitoSolicitoSolicito Solicito',
    hallazgos: 'Se encuentra raidador dañado, con porocidad, y fugas Se encuentra raidador dañado, con porocidad, y fugas Se encuentra raidador dañado, con porocidad, y fugas Se encuentra raidador dañado, con porocidad, y fugas ',  
    reporte: 'Se realiza cambio del panel del radiador, dejandose con mayor poder de enfriamiento, se deja funcional la valvula de desague, y se cambia la tuberia de desague. Se realiza cambio del panel del radiador, dejandose con mayor poder de enfriamiento, se deja funcional la valvula de desague, y se cambia la tuberia de desague. Se realiza cambio del panel del radiador, dejandose con mayor poder de enfriamiento, se deja funcional la valvula de desague, y se cambia la tuberia de desague. ',
    recomendaciones:'Mantenimiento a 15000 impresiones o copias, o a los 3 meses lo que se cumpla primero',
    usuarioReporte:'Rafael Jose Huertas Ruiz',
    usuarioAprobado:'Martha Cecilia Bitar Calle',
    width: 110,
    height: 110,
}
var dd = {
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
                            image: 'sampleImage.jpg',
                            width: data.width,
                            height: data.height,
                        },
                        '',
                        { text: 'Nombre:', bold: true },
                        { colSpan: 2, text: data.nombre },
                        '',
                        { text: 'Tipo Activo:', bold: true },
                        { text: 'Medico: ' + data.biomedico, bold: true },
                        { text: 'Apoyo:' +  data.apoyo, bold: true },
                        

                    ],
                    [
                        '',
                        '',
                        { text: 'Codigo:', bold: true },
                        data.codigo,
                        { text: 'Ubicacion:', bold: true },
                        data.ubicacion,
                        { text: 'Proceso:', bold: true },
                        {text: data.proceso },
                        
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
                hLineWidth: function(i, node) {
                     return 0; // eliminar borde superior e inferior
                },
                vLineWidth: function(i, node) {
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
                widths:[49, 35, 60, 55, '*', 35, '*', 35, 55],
                body: [
                    [
                        { 
                            colSpan: 9,
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
                    ],
                    [
                        { text: '# Reporte:', bold: true },
                        { text: data.idReporte, bold: true, color:'red' },
                        { text: 'Fecha Mtto', bold: true },
                        { text: data.fechaReporte },
                        { text: '# Solicitud:', bold: true, },
                        { text: data.idSolicitud, color:'red' },
                        { text: 'Tipo Mtto', bold: true },
                        { text: 'Pre: ' +  data.perventivo, bold: true },
                        { text: 'Cor: ' + data.correctivo, bold: true },
                    ],
                    [
                        { text: 'Proveedor:', bold: true },
                        {colSpan:2, text: data.proveedor},
                        '',
                        { text: 'MO: ', bold: true },
                        data.mo,
                        { text: 'MP: ', bold: true },
                         data.mp,
                        { text: 'Proximo Mtto:', bold: true },
                        { text: data.proximoMtto },
                
                        
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: 'Descripcion De La Solicitud:',
                            bold: true
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: data.solicitud,
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: 'Hallazgos',
                            bold: true
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: data.hallazgos,
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: 'Reporte Tecnico',
                            bold: true
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: data.reporte,
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: 'Recomendaciones',
                            bold: true
                        },
                    ],
                    [
                        { 
                            colSpan: 9,
                            text: data.recomendaciones,
                        },
                    ],
                    
                ]
            },
            layout: {
                hLineWidth: function(i, node) {
                     return 0; // eliminar borde superior e inferior
                },
                vLineWidth: function(i, node) {
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
                    [
                        {
                            image: 'sampleImage.jpg',
                            width: 110,
                            height: 50,
                            margin: [0, 0, 0, 5]
                        },
                        {
                            image: 'sampleImage.jpg',
                            width: 110,
                            height: 50,

                        },
                        {
                            image: 'sampleImage.jpg',
                            width: 110,
                            height: 50,

                        },
                        {
                            image: 'sampleImage.jpg',
                            width: 110,
                            height: 50,

                        }
                    ],
                ]

            },
            layout: 'noBorders'
        },
        {
            style: 'tableBodyImagenes',
            table: {
                widths: ['*','*'],
                body: [
                    [
                        {
                            image: 'sampleImage.jpg',
                            fit: [70, 70]
                        },
                        {
                            image: 'sampleImage.jpg',
                            fit: [70, 70]

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
            layout:'noBorders'
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
                            { rowSpan: 3, image: 'sampleImage.jpg', fit: [70, 70], margin: [3, 12, 0, 0], borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                            { text: 'SISTEMA DE GESTION INTEGRAL', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                            { text: 'CODIGO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                            { text: 'F-IN-0', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
                        ],
                        [
                            '',
                            { text: 'CLINICA OFTALMOLOGICA DE SINCELEJO LTDA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                            { text: 'VERSION', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                            { text:0, borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }],
                        [
                            '',
                            { text: 'REPORTE TECNICO DE MANTENIMIENTO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
                            { text: 'PAGiNA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
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
            margin: [0, 7, 0, 0],
            alignment: 'center',
        }
    },

}