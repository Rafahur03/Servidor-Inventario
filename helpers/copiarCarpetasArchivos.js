import { promises as fspromises } from 'fs'; // Importa el módulo fs con promesas
import fs from 'fs'
import mime from 'mime-types'
import { bufferNoImage } from './crearPdfMake.js'

const path = process.env.PATH_FILES

// funcion para cuando cambian de clasificacion un activo
const copiarYCambiarNombre = async (data) => {
	try {

		const { siglaAntigua, siglaNueva, codigoAntiguo, codigoNuevo } = data

		//Cambiar ubicacion y nombre de una carpeta
		await fspromises.rename(`${path}\\${siglaAntigua}\\${codigoAntiguo}`, `${path}\\${siglaNueva}\\${codigoNuevo}`);
		// cambia los nombres de los archivos al nuevo codigo

		const carpeta = `${path}\\${siglaNueva}\\${codigoNuevo}\\`
		const extenciones = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'pdf', 'PDF']
		const archivos = await fspromises.readdir(carpeta);

		const promesasRenombramiento = archivos.map((archivo) => {
			const nuevoNombre = archivo.replace(codigoAntiguo, codigoNuevo)
			const viejoNombre = `${carpeta}${archivo}`;
			const nuevoNombreCompleto = `${carpeta}${nuevoNombre}`;
			const tipo = mime.extension(mime.lookup(nuevoNombre))
			if (extenciones.includes(tipo)) {
				return fspromises.rename(viejoNombre, nuevoNombreCompleto);
			}
		});

		await Promise.all(promesasRenombramiento);
		return true

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al guardar las imagenes' }
	}
}

const guardarImagenesBase64 = async (imagen, data, destino) => {

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	const base64Regex = /^data:(.+);base64,(.*)$/;
	if (typeof imagen !== 'string' || !base64Regex.test(imagen))
		return { msg: 'El tipo de archivo no es válido' };

	const mimeType = imagen.split(',')[0].split(';')[0].split(':')[1];
	const extensiones = ['png', 'jpg', 'jpeg'];
	if (!extensiones.includes(mime.extension(mimeType)))
		return { msg: 'Solo se aceptan imágenes en formato png, jpg o jpeg' };

	const imgBase64 = imagen.split(',')[1];
	const decodedData = Buffer.from(imgBase64, 'base64');
	const sizeInBytes = decodedData.length;
	if (sizeInBytes > 6291456)
		return { msg: 'Solo se aceptan imágenes de tamaño hasta 6 Mb' };

	try {
		let pathActivo;

		switch (destino) {
			case 1:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\${data.idSolicitud}\\`;
				break;
			case 2:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Reporte\\${data.idReporte}\\`;
				break;
			case 3:
				pathActivo = `${path}\\Usuarios\\`;
				break;
			default:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\`;
				break;
		}

		try {
			fs.accessSync(pathActivo, fs.constants.F_OK);
		} catch (error) {
			if (error.code === 'ENOENT') {
				fs.mkdirSync(pathActivo, { recursive: true });
			} else {
				throw error;
			}
		}


		const extencion = mime.extension(mimeType);
		const nuevoNombre = `${Date.now()}${getRandomInt(100)}.${extencion}`;
		const pathDestino = `${pathActivo}${nuevoNombre}`;

		fs.writeFileSync(pathDestino, decodedData);

		return nuevoNombre;
	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return {
			msg: 'Ocurrió un error al intentar guardar la imagen. Inténtalo más tarde.',
		};
	}
}

const guardarImagenesNuevoActivo = async (files, data, destino) => {

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	try {

		let pathActivo

		switch (destino) {
			case 1:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\`
				break

			case 2:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Reporte\\`
				break

			default:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
				break
		}


		try {
			await fspromises.access(pathActivo, fspromises.constants.F_OK);
		} catch (error) {
			await fspromises.mkdir(pathActivo);
		}

		// copia las imagenes a las carptea del activo
		const url_img = []
		// verificamos si es una o mas de una imagen. 
		const dimension = files.Image.length
		const tipo = typeof dimension === 'undefined'
		const extenciones = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JEPG']
		if (!tipo) {
			const promesasDeCopia = files.Image.map(async file => {
				const extencion = mime.extension(file.mimetype)
				if (extenciones.includes(extencion)) {
					const pathOrigen = file.filepath
					let nuevoNombre
					if (destino) {
						nuevoNombre = `${Date.now()}${getRandomInt(100)}.${extencion}`
					} else {
						nuevoNombre = `${data.codigo}-${Date.now()}${getRandomInt(100)}.${extencion}`
					}

					const pathDestino = `${pathActivo}${nuevoNombre}`
					url_img.push(nuevoNombre)
					return fspromises.copyFile(pathOrigen, pathDestino);
				}
			})
			await Promise.all(promesasDeCopia);

			// elimina nos archivos temporales 
			const promesasEliminar = files.Image.map(async file => {
				const pathOrigen = file.filepath
				return fspromises.unlink(pathOrigen);
			})
			await Promise.all(promesasEliminar);

		} else {
			const extencion = mime.extension(files.Image.mimetype)
			if (extenciones.includes(extencion)) {
				const pathOrigen = files.Image.filepath
				let nuevoNombre
				if (destino) {
					nuevoNombre = `${Date.now()}${getRandomInt(100)}.${extencion}`
				} else {
					nuevoNombre = `${data.codigo}-${Date.now()}${getRandomInt(100)}.${extencion}`
				}
				const pathDestino = `${pathActivo}${nuevoNombre}`
				url_img.push(nuevoNombre)
				await fspromises.copyFile(pathOrigen, pathDestino)
				await fspromises.unlink(pathOrigen)
			}
		}
		return url_img

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al guardar las imagenes' }
	}
}

const bufferimagenes = async (url_img, data, destino) => {

	if (url_img == null || url_img == '' || url_img == 'undefined') {

		return [await bufferNoImage()]
	}
	let pathActivo
	switch (destino) {
		case 1:
			pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\${data.idSolicitud}\\`
			break

		case 2:
			pathActivo = `${path}${data.siglas}\\${data.codigo}\\Reporte\\${data.idReporte}\\`
			break

		default:
			pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
			break
	}

	try {
		const imageBuffers = url_img.map(imageName => {
			const imagePath = pathActivo + imageName
			const buffer = fs.readFileSync(imagePath);
			const bufferCompleto = `data:${mime.lookup(imageName)};base64,${buffer.toString('base64')}`
			return bufferCompleto
		});
		return imageBuffers

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'no fue posible obtener las imagenes' }

	}


}

const bufferimagen = async (url_img, data, destino) => {

	if (url_img == null || url_img == '' || url_img == 'undefined') {

		return [await bufferNoImage()]
	}

	let pathActivo
	switch (destino) {
		case 1:
			pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\`
			break

		case 2:
			pathActivo = `${path}${data.siglas}\\${data.codigo}\\Reporte\\`
			break
		case 3:
			pathActivo = `${path}\\Usuarios\\`;
			break;
		default:
			pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
			break
	}

	const imagePath = pathActivo + url_img
	const buffer = fs.readFileSync(imagePath);
	const bufferCompleto = `data:${mime.lookup(url_img)};base64,${buffer.toString('base64')}`
	return bufferCompleto
}

const eliminarImagenes = async (file, data, destino) => {

	try {
		let pathActivo
		switch (destino) {
			case 1:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\${data.idSolicitud}\\`
				break

			case 2:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Reporte\\${data.idReporte}\\`
				break

			default:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
				break
		}


		const pathOrigen = pathActivo + file
		await fspromises.unlink(pathOrigen)
		return ({ exito: 'Imagen eliminada correctamente' })

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al elimiar la imagenes' }
	}
}

const eliminarCarpetaActivo = async (data) => {

	try {
		const { siglas, codigo } = data
		//renonbrar carpeta 
		await fspromises.rename(`${path}\\${siglas}\\${codigo}`, `${path}\\${siglas}\\${codigo}-E`)

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'Error al intentat eliminar la carpeta del activo' }
	}
}

const eliminarImagenesSoliRepor = async (file, data, destino) => {

	try {
		let pathActivo
		switch (destino) {
			case 1:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\${data.idSolicitud}\\`
				break

			case 2:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Reporte\\${data.idReporte}\\`
				break

			default:
				return ({ msg: 'esta funcion es solo para reportes y solicitudes' })
				break
		}
		await fspromises.rename(pathActivo + file, `${pathActivo}\\E-${file}`);
		return ({ exito: 'Imagen eliminada correctamente' })

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al elimiar las imagenes' }
	}
}

const guardarPDF = async (file, data, complemento) => {

	try {

		//valida que la carpeta del activo exista
		const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
		try {
			await fspromises.access(pathActivo, fspromises.constants.F_OK);
		} catch (error) {
			await fspromises.mkdir(pathActivo);
		}

		// copia las imagenes a las carptea del activo

		//crea los paht y los nombres de archivo
		const extencion = mime.extension(file.mimetype)
		const pathOrigen = file.filepath
		const nuevoNombre = `${data.codigo}-${complemento}.${extencion}`
		const pathDestino = `${pathActivo}${nuevoNombre}`
		await fspromises.copyFile(pathOrigen, pathDestino)
		await fspromises.unlink(pathOrigen)
		//devuelve el nombre del archivo
		return (nuevoNombre)


	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: `error al guardar el archivo ${complemento} ` }
	}
}

const guardarDocumentoBase64 = async (datos, data, destino) => {

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	const file = datos.file

	// validat tipo de archivo
	const base64Regex = /^data:(.+);base64,(.*)$/;
	if (typeof file !== 'string' || !base64Regex.test(file)) return { msg: 'El tipo de archivo no es valido' }

	// validar extencion de la imagen
	const mimeType = file.split(',')[0].split(';')[0].split(':')[1]
	if (mime.extension(mimeType) !== 'pdf') return { msg: 'Solo se acepta formato pdf' }
	//validar tamaño de la imagen
	const imgBase64 = file.split(',')[1]
	const decodedData = Buffer.from(imgBase64, 'base64');
	const sizeInBytes = decodedData.length
	if (sizeInBytes > 6291456) return { msg: 'Solo se aceptan documentos de tamaño menor de 6 Mb' }

	try {
		const extencion = mime.extension(mimeType)
		let pathActivo
		let nuevoNombre

		switch (destino) {
			case 1:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\Solicitud\\`
				nuevoNombre = `${data.codigo}-${datos.documento}-${getRandomInt(100)}.${extencion}`
				break

			case 2:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
				nuevoNombre = `${datos.documento}-${data.codigo}-${datos.idReporte}.${extencion}`
				break

			default:
				pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
				nuevoNombre = `${data.codigo}-${datos.documento}-${getRandomInt(100)}.${extencion}`
				break
		}


		try {
			await fspromises.access(pathActivo, fspromises.constants.F_OK);
		} catch (error) {
			await fspromises.mkdir(pathActivo);
		}
		const pathDestino = `${pathActivo}${nuevoNombre}`
		await fspromises.writeFile(pathDestino, decodedData);
		return nuevoNombre

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'ocurrio un error al intentar guardar el documento intentalo más tarde' }
	}
}

const elimnarSoportePdf = async (file, data) => {

	try {
		const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
		await fspromises.rename(pathActivo + file, `${pathActivo}E-${file}`);
		return { exito: 'documento eliminado correctamente' }
	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al elimiar las imagenes' }
	}
}

const bufferSoportespdf = (soportes, data) => {
	const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
	let bufferpdf = {}
	for (let soporte in soportes) {
		const imagePath = pathActivo + soportes[soporte]
		const buffer = fs.readFileSync(imagePath);
		bufferpdf[soporte] = `data:${mime.lookup(soportes[soporte])};base64,${buffer.toString('base64')}`
	};
	return bufferpdf
}

const bufferSoportepdf = async (soportes, data, reporte = null) => {
	try {

		const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
		let soportePath
		if (reporte === null) {
			soportePath = pathActivo + soportes
		} else {
			soportePath = pathActivo + `${soportes}-${data.codigo}-${reporte}.pdf`
		}

		const buffer = fs.readFileSync(soportePath);
		const bufferpdf = `data:application/pdf;base64,${buffer.toString('base64')}`
		return bufferpdf

	} catch (error) {
		return { msg: 'no se pudo devolver el buffer' }
	}
}

const guadarReporteFinal = async (bufferPdf, data, id) => {
	const pathReporte = path + data.siglas + '\\' + data.codigo + '\\' + id + '.pdf'
	try {
		var buf = Buffer.from(bufferPdf, 'base64')
		await fspromises.writeFile(pathReporte, buf)
		return 1
	} catch (error) {
		console.log(error)
		return 0
	}

}

const guadarReporteEliminadoBd = async (bufferPdf, data) => {
	const pathReporte = path + data.siglas + '\\' + data.codigo + '\\Reporte\\' + data.idReporte + '\\reporteEliminado-' + data.idReporte + '.pdf'
	try {
		var buf = Buffer.from(bufferPdf, 'base64')
		await fspromises.writeFile(pathReporte, buf)
		return 1
	} catch (error) {
		console.log(error)
		return 0
	}

}

const bufferReporte = (data, id) => {
	const pathSoporte = `${path}${data.siglas}\\${data.codigo}\\${id}.pdf`
	const buffer = fs.readFileSync(pathSoporte);
	return `data:application/pdf;base64,${buffer.toString('base64')}`
}

const eliminarReporteExterno = async (data) => {
	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	try {

		const pathReporte = `${path}\\${data.siglas}\\${data.codigo}\\Reporte\\${data.reporte}`
		try {
			await fspromises.access(pathReporte, fspromises.constants.F_OK);
		} catch (error) {
			await fspromises.mkdir(pathReporte);
		}

		//Cambiar ubicacion y nombre del archivo
		await fspromises.rename(`${path}\\${data.siglas}\\${data.codigo}\\Rep-${data.codigo}-${data.reporte}.pdf`, `${pathReporte}\\E-Rep-${data.codigo}-${data.reporte}-${getRandomInt(50)}.pdf`);
		return true

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'No fue posible eliminar el archivo del directorio' }
	}
}


export {
	copiarYCambiarNombre,
	guardarImagenesNuevoActivo,
	guardarImagenesBase64, // nuevo
	bufferimagenes,
	bufferimagen, // nuevo
	eliminarImagenes,
	eliminarCarpetaActivo,
	eliminarImagenesSoliRepor,
	guardarPDF,
	bufferSoportespdf,
	bufferSoportepdf,// nuevo solo un soporte 
	elimnarSoportePdf,
	guadarReporteFinal,
	bufferReporte,
	guardarDocumentoBase64,
	eliminarReporteExterno, //nuevo
	guadarReporteEliminadoBd
}