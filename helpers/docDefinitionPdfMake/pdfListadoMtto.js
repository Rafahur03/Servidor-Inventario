import fs from 'fs'
import pdfMake from 'pdfmake/build/pdfmake.js'
import vfsFonts from 'pdfmake/build/vfs_fonts.js'

const ddListadoReporte = async data => {

	pdfMake.vfs = vfsFonts.pdfMake.vfs;
	const dd = {
		pageSize: 'LETTER',
		pageMargins: [40, 80, 40, 40],
		pageOrientation: 'landscape',

		content: [
			{
				style: 'tableBodyData',
				table: {
					widths: [5, 30, 56, '*', '*', '*', '*', 56],
					body: data.body,

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
					margin: [40, 10, 40, 0],
					rowSpan: 3, image: data.logo,
					fit: [60, 30],
					alignment: 'left',
				},
				{
					margin: [40, 0, 40, 5],
					text: 'LISTADO DE MANTENIMIENTOS DEL ACTIVO:',
					alignment: 'center',
					fontSize: 12,
					bold: true
				},
				{
					margin: [40, 0, 40, 5],
					text:  data.codigo + '-' + data.nombre.toUpperCase(),
					alignment: 'center',
					fontSize: 12,
					bold: true
				}
			]
		},
		footer: function (currentPage, pageCount) {
			return {
				text: 'Página ' + currentPage.toString() + ' de ' + pageCount.toString(),
				alignment: 'center',
				fontSize: 10,
				bold: true
			}
		},
		styles: {

			tableBodyData: {
				fontSize: 10,
				margin: [0, 10, 0, 0],
				alignment: 'justify',
			},
		},


	}

	console.log(dd)
	return dd
}

export{
	ddListadoReporte
}