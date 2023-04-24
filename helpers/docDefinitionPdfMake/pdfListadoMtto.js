// playground requires you to assign document definition to a variable called dd
const data ={
    nombre: 'Maquina Anestesica',
    codigo:'EM0001',
    index:[1,2,3,4,5,6],
    idReporte:[500,499,498,497,496,495],
    fechaReporte:['18/04/2022', '17/04/2021', '16/04/2021', '15/04/2021', '14/04/2021', '13/04/2021'],
    hallazgos:['hallazgos 1 hallazgos 1 hallazgos 1 hallazgos 1 hallazgos 1 hallazgos 1 hallazgos 1',
                'hallazgos 2 hallazgos 2  hallazgos 2  hallazgos 2  hallazgos2 1hallazgos 2 hallazgos 2 ',
                'hallazgos 3 hallazgos 3 hallazgos 3 hallazgos 3 hallazgos 3hallazgos 3hallazgos 3',
                'hallazgos 4 hallazgos 4 hallazgos 4 hallazgos 4 hallazgos 4hallazgos 4hallazgos 4',
                'hallazgos 5 hallazgos 5 hallazgos 5 hallazgos 5 hallazgos 5hallazgos 5hallazgos 5',
                'hallazgos 6 hallazgos 6 hallazgos 6 hallazgos 6 hallazgos 6hallazgos 6hallazgos 6',
            ],
    reporte:['reportes de mantenimeinto tienen mucho texto demaciado diria yo 1 reportes de mantenimeinto tienen mucho texto demaciado diria yo 1 reportes de mantenimeinto tienen mucho texto demaciado diria yo 1 reportes de mantenimeinto tienen mucho texto demaciado diria yo 1 reportes de mantenimeinto tienen mucho texto demaciado diria yo 1 reportes de mantenimeinto tienen mucho texto demaciado diria yo 1 reportes de mantenimeinto tienen mucho texto demaciado diria yo 1',
                'reportes de mantenimeinto tienen mucho texto demaciado diria yo 2 reportes de mantenimeinto tienen mucho texto demaciado diria yo 2  reportes de mantenimeinto tienen mucho texto demaciado diria yo 2  reportes de mantenimeinto tienen mucho texto demaciado diria yo 2  reportes de mantenimeinto tienen mucho texto demaciado diria yo2 1reportes de mantenimeinto tienen mucho texto demaciado diria yo 2 reportes de mantenimeinto tienen mucho texto demaciado diria yo 2 ',
                'reportes de mantenimeinto tienen mucho texto demaciado diria yo 3 reportes de mantenimeinto tienen mucho texto demaciado diria yo 3 reportes de mantenimeinto tienen mucho texto demaciado diria yo 3 reportes de mantenimeinto tienen mucho texto demaciado diria yo 3 reportes de mantenimeinto tienen mucho texto demaciado diria yo 3reportes de mantenimeinto tienen mucho texto demaciado diria yo 3reportes de mantenimeinto tienen mucho texto demaciado diria yo 3',
                'reportes de mantenimeinto tienen mucho texto demaciado diria yo 4 reportes de mantenimeinto tienen mucho texto demaciado diria yo 4 reportes de mantenimeinto tienen mucho texto demaciado diria yo 4 reportes de mantenimeinto tienen mucho texto demaciado diria yo 4 reportes de mantenimeinto tienen mucho texto demaciado diria yo 4reportes de mantenimeinto tienen mucho texto demaciado diria yo 4reportes de mantenimeinto tienen mucho texto demaciado diria yo 4',
                'reportes de mantenimeinto tienen mucho texto demaciado diria yo 5 reportes de mantenimeinto tienen mucho texto demaciado diria yo 5 reportes de mantenimeinto tienen mucho texto demaciado diria yo 5 reportes de mantenimeinto tienen mucho texto demaciado diria yo 5 reportes de mantenimeinto tienen mucho texto demaciado diria yo 5reportes de mantenimeinto tienen mucho texto demaciado diria yo 5reportes de mantenimeinto tienen mucho texto demaciado diria yo 5',
                'reportes de mantenimeinto tienen mucho texto demaciado diria yo 6 reportes de mantenimeinto tienen mucho texto demaciado diria yo 6 reportes de mantenimeinto tienen mucho texto demaciado diria yo 6 reportes de mantenimeinto tienen mucho texto demaciado diria yo 6 reportes de mantenimeinto tienen mucho texto demaciado diria yo 6reportes de mantenimeinto tienen mucho texto demaciado diria yo 6reportes de mantenimeinto tienen mucho texto demaciado diria yo 6',
            ],
    recomendaciones:['recomendCIONES 1 recomendCIONES 1 recomendCIONES 1 recomendCIONES 1 recomendCIONES 1 recomendCIONES 1 recomendCIONES 1',
                'recomendCIONES 2 recomendCIONES 2  recomendCIONES 2  recomendCIONES 2  recomendCIONES2 1recomendCIONES 2 recomendCIONES 2 ',
                'recomendCIONES 3 recomendCIONES 3 recomendCIONES 3 recomendCIONES 3 recomendCIONES 3recomendCIONES 3recomendCIONES 3',
                'recomendCIONES 4 recomendCIONES 4 recomendCIONES 4 recomendCIONES 4 recomendCIONES 4recomendCIONES 4recomendCIONES 4',
                'recomendCIONES 5 recomendCIONES 5 recomendCIONES 5 recomendCIONES 5 recomendCIONES 5recomendCIONES 5recomendCIONES 5',
                'recomendCIONES 6 recomendCIONES 6 recomendCIONES 6 recomendCIONES 6 recomendCIONES 6recomendCIONES 6recomendCIONES 6',
            ],
    proveedor:['Clinica Oftalmologica De Sincelejo Ltda',
            'Clinica Oftalmologica De Sincelejo Ltda',
            'Clinica Oftalmologica De Sincelejo Ltda',
            'Clinica Oftalmologica De Sincelejo Ltda',
            'Clinica Oftalmologica De Sincelejo Ltda',
            'Clinica Oftalmologica De Sincelejo Ltda'],
    fechaProximo:['18/04/2023','18/04/2022', '17/04/2021', '16/04/2021', '15/04/2021', '14/04/2021'],        
            
    
}
var dd = {
        pageSize: 'LETTER',
        pageMargins: [40, 80, 40, 40], 
        pageOrientation: 'landscape',
        
	content: [
	            {
	                style: 'tableBodyData',
	                table:{
	                    widths: [5, 30, 56, '*', '*', '*', '*', 56],
	                    body:[
	                        
	                            [
	                                { text:'#', bold: true, alignment: 'center'},
	                                { text:'Id', bold: true, alignment: 'center'},
	                                { text:'Fecha del reporte', bold: true, alignment: 'center'},
	                                { text:'Hallazgos', bold: true, alignment: 'center'},
	                                { text:'Reporte Tecnico', bold: true, alignment: 'center'},
	                                { text:'Recomendaciones', bold: true, alignment: 'center'},
	                                { text:'Proveedor', bold: true, alignment: 'center'},
	                                { text:'Fecha Proximo Mtto', bold: true, alignment: 'center'},
	                             
	                            ],
	                            [
	                                data.index[0],
	                                data.idReporte[0],
	                                data.fechaReporte[0],
	                                data.hallazgos[0],
	                                data.reporte[0],
	                                data.recomendaciones[0],
	                                data.proveedor[0],
	                                data.fechaProximo[0],
	                             
	                            ],
	                            [
	                                data.index[1],
	                                data.idReporte[1],
	                                data.fechaReporte[1],
	                                data.hallazgos[1],
	                                data.reporte[1],
	                                data.recomendaciones[1],
	                                data.proveedor[1],
	                                data.fechaProximo[1],
	                             
	                            ],
	                            [
	                                data.index[2],
	                                data.idReporte[2],
	                                data.fechaReporte[2],
	                                data.hallazgos[2],
	                                data.reporte[2],
	                                data.recomendaciones[2],
	                                data.proveedor[2],
	                                data.fechaProximo[2],
	                             
	                            ],
	                            [
	                                data.index[3],
	                                data.idReporte[3],
	                                data.fechaReporte[3],
	                                data.hallazgos[3],
	                                data.reporte[3],
	                                data.recomendaciones[3],
	                                data.proveedor[3],
	                                data.fechaProximo[3],
	                             
	                            ],
	                            [
	                                data.index[4],
	                                data.idReporte[4],
	                                data.fechaReporte[4],
	                                data.hallazgos[4],
	                                data.reporte[4],
	                                data.recomendaciones[4],
	                                data.proveedor[4],
	                                data.fechaProximo[4],
	                             
	                            ],
	                            [
	                                data.index[5],
	                                data.idReporte[5],
	                                data.fechaReporte[5],
	                                data.hallazgos[5],
	                                data.reporte[5],
	                                data.recomendaciones[5],
	                                data.proveedor[5],
	                                data.fechaProximo[0],
	                            ]
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
				            return (rowIndex % 2 === 0) ? '#dddddd' : null;
	    	        	},
			        }
	            },

	        ],
	        
    header: function(currentPage, pageCount) {
        return [
            {
               margin:[40,20,40,0],
               rowSpan: 3,image: 'sampleImage.jpg',
               fit: [70, 70],
               alignment: 'left',
            },
            {
                margin:[40,0,40,0],
                text: 'LISTADO DE MANTENIMIENTOS DEL ACTIVO: ' + data.codigo + '-' + data.nombre.toUpperCase(),
                alignment: 'center',
                fontSize: 12,
                bold: true
            }
        ]
    },
    footer: function(currentPage, pageCount) {
        return {
            text: 'Página ' + currentPage.toString() + ' de ' + pageCount.toString(),
            alignment: 'center',
            fontSize: 10,
            bold: true
        }
    },
    styles: {
        
        tableBodyData:{   
            fontSize: 10,
			margin:[0,10,0,0],
			alignment: 'justify',
        },
    },
     

}