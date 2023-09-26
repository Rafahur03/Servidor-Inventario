// playground requires you to assign document definition to a variable called dd
import fs from 'fs'
import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

const ddSolicitud = async data => {
	
	pdfMake.vfs = vfsFonts.pdfMake.vfs;
	const dd = {
		pageSize: 'LETTER',
		pageMargins: [40, 83, 40, 40],
		content: [

			{
				style: 'tableBodyData',
				table: {
					widths: [65, 65, 39, '*', 56, '*', 60.5, 5, '*', 5],
					body: [
						[
							{
								rowSpan: 5,
								colSpan: 2,
								image: data.url_img,
								width: 140,
								height: 140,
								margin: [2, 0, 6, 0]
							},
							'',
							{ text: 'Nombre:', bold: true },
							{ colSpan: 2, text: data.nombre },
							'',
							{ text: 'Tipo Activo:', bold: true },
							{ text: 'Medico:', bold: true },
							data.biomedico,
							{ text: 'Apoyo:', bold: true },
							data.apoyo,

						],
						[
							'',
							'',
							{ text: 'Codigo:', bold: true },
							data.codigo,
							{ text: 'Ubicacion:', bold: true },
							data.ubicacion,
							{ text: 'Proceso:', bold: true },
							{ colSpan: 3, text: data.proceso },
							'',
							'',
						],
						[
							'',
							'',
							{ text: 'Marca:', bold: true, },
							data.marca,
							{ text: 'Area:', bold: true },
							data.area,
							{ text: 'Responsable:', bold: true },
							{ colSpan: 3, text: data.responsable },
							'',
							'',
						],
						[
							'',
							'',
							{ text: 'Modelo:', bold: true },
							data.modelo,
							{ text: 'Proveedor:', bold: true },
							{ colSpan: 4, text: data.proveedor },
							'',
							'',
							'',
							'',
						],
						[
							'',
							'',
							{ text: 'Serie:', bold: true },
							{ text: data.serie },
							{ text: 'Frecuencia de Mtto:', bold: true },
							data.frecuencia,
							{ text: 'Estado', bold: true },
							{ colSpan: 3, text: data.estado },
							'',
							'',
						],
						[
							{ colSpan: 10, text: 'DATOS DE LA SOLICITUD:', bold: true, margin: [0, 15, 0, 10] },
						],
						[
							{ text: 'Id Solicitud:', bold: true, color:'red' },
							data.idSolicitud,
							{ colSpan: 2, text: 'Fecha Solicitud', bold: true },
							'',
							{ text: data.fechaSolicitud },
							{ text: 'Usuario Solicitud', bold: true },
							{ colSpan: 4, text: data.usuarioSolicitud },
							'',
							'',
							'',

						],
						[
							{ colSpan: 10, text: 'Descripcion del problema:', bold: true, },
						],
						[
							{ colSpan: 10, text: data.solicitud, },
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
				style: 'tableBodyImagenes',
				table: {
					widths: [124.7, 124.7, 124.7, 124.7],
					body: [
						data.imgSolicitud,
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
								{ rowSpan: 3, image: data.logo,  fit: [60, 30], margin: [3, 7, 0, 0], borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 'SISTEMA DE GESTION INTEGRAL', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 'CODIGO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 'F-IN-02', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }
							],
							[
								'',
								{ text: 'CLINICA OFTALMOLOGICA DE SINCELEJO LTDA', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 'VERSION', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
								{ text: 0, borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] }],
							[
								'',
								{ text: 'SOLICITUD DE MANTENIMIENTO', borderColor: ['#8DC049', '#8DC049', '#8DC049', '#8DC049'] },
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
				margin: [40, 20, 40, 0]
			},
			tableBodyData: {
				fontSize: 10,
				margin: [0, 10, 0, 0],
				alignment: 'center',
			},
			tableBodyImagenes: {
				fontSize: 10,
				margin: [0, 10, 0, 0],
				alignment: 'center',
			}
		},

	}
	return dd
}

export{ddSolicitud}