import fs from 'fs'
import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'
const imageData = fs.readFileSync('C:\\Users\\USER\\Pictures\\COS.png');
const imageDataURLprueba = `data:image/png;base64,${Buffer.from(imageData).toString('base64')}`;

// playground requires you to assign document definition to a variable called dd
const data = {
	nombre: 'Maquina Anestesica',
	codigo: 'EM0001',
	marca: 'Mindray',
	modelo: 'WATO EX-20',
	serie: '12255sss',
	riesgo: 'VII',
	fechaCompra: '01/05/2022',
	garantia: '30/04/2023',
	apoyo: '',
	biomedico: 'X',
	ubicacion: 'Quirofano',
	responsable: 'Maira Gisela Dominguez Perez',
	estado: 'Dado de baja',
	frecuencia: 'Anual',
	proceso: 'Gestion Administrativa Y Financiera',
	area: 'Admisiones',
	proveedor: 'Clinica Oftalmologica de Sincelejo Ltda',
	factura: 'factura 25666',
	valor: 256566666,
	ingreso: '17/04/2023',
	descripcion: 'La lámpara para procedimientos menores GS 900: Seis LED que combinan una impresionante durabilidad, una excelente maniobrabilidad, una calidad de enfoque incomparable y varias opciones de montaje. Emisión de calor mínima y temperatura de color elevada. Menor consumo de energía. Sin necesidad de sustituir la bombilla',
	recomendaciones: '"Mantenimiento general, limpieza de todos los módulos del equipo,limpieza externa, Calibración, verificación de estado general "',
	observacion: 'ingresa del invetario anterior con codigo 0620',
	width: 140,
	height: 140,
}

const ddHojaDeVida = aaa => {
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
							{ rowSpan: 5, image: imageDataURLprueba, width: data.width, height: data.height, margin: [2, 0, 6, 0] },
							{ text: 'Nombre:', bold: true },
							{ colSpan: 2, text: data.nombre },
							'',
							{ text: 'Tipo Activo:', bold: true },
							{ text: 'Medico:', bold: true },
							data.biomedico,
							{ text: 'Apoyo:', bold: true },
							data.apoyo,
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
					body: [
						[
							{ text: 'ESPECIFICACIONES TECNICAS DE COMPONENTES', fontSize: 12, margin: [0, 0, 0, 5], colSpan: 5, bold: true, alignment: 'center' },
							'',
							'',
							'',
							''
						],
						[
							{ text: 'COMPONENTE:', bold: true },
							{ text: 'Marca:', bold: true },
							{ text: 'Modelo:', bold: true },
							{ text: 'Serie:', bold: true },
							{ text: 'Capacidad:', bold: true },
						],
						[
							{ text: 'Disco Duro:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'M. RAM:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Procesador:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Board:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Monitor:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Teclado:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Camara:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Mouse:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
						],
						[
							{ text: 'Otros:', bold: true },
							'Marca',
							'Modelo',
							'Serie',
							'Capacidad'
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
								{ text: 'F-IN-02', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
							],
							[
								'',
								{ text: 'CLINICA OFTALMOLOGICA DE SINCELEJO LTDA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 'VERSION', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 3, borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }],
							[
								'',
								{ text: 'HOJA DE VIDA DE EQUIPOS', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
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


export {ddHojaDeVida}