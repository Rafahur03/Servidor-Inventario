import { promises as fspromises } from 'fs'; // Importa el módulo fs con promesas
import fs from 'fs'
import mime from 'mime-types'
import { bufferNoImage } from './crearPdfMake.js';


const path = process.env.PATH_FILES

// funcion para cuando cambian de clasificacion un activo
const copiarYCambiarNombre = async (data) => {
	try {

		const { siglaAntigua, siglaNueva, codigoAntiguo, codigoNuevo } = data

		//Cambiar ubicacion y nombre de una carpeta
		await fspromises.rename(`${path}\\${siglaAntigua}\\${codigoAntiguo}`, `${path}\\${siglaNueva}\\${codigoNuevo}`);
		// cambia los nombres de los archivos al nuevo codigo

		const carpeta = `${path}\\${siglaNueva}\\${codigoNuevo}\\`
		const extenciones = ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'pdf','PDF']
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

const bufferimagenes = (url_img, data, destino) => {
	if(url_img == null || url_img == ''){
		return bufferNoImage()
	}
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

	const imageBuffers = url_img.map(imageName => {
		const imagePath = pathActivo + imageName
		const buffer = fs.readFileSync(imagePath);
		const bufferCompleto = `data:${mime.lookup(imageName)};base64,${buffer.toString('base64')}`
		return bufferCompleto
	});
	return imageBuffers
}

const elimnarImagenes = async (files, data, destino) => {

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

		const promesasEliminar = files.map(async file => {
			const pathOrigen = pathActivo + file
			await fspromises.unlink(pathOrigen);
		})
		await Promise.all(promesasEliminar);
	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al elimiar las imagenes' }
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

const elimnarImagenesSoliRepor = async (files, data, destino) => {

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
				return ({ msg: 'esta funcion es solo para reportes y solicitudes' })
				break
		}

		const promesasEliminar = files.map(async file => {
			const pathOrigen = pathActivo + file
			return await fspromises.rename(pathActivo + file, `${pathActivo}\\E-${file}`);
		})
		await Promise.all(promesasEliminar);
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

const elimnarSoportePdf = async (file, data) => {

	try {
		const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
			 await fspromises.rename(pathActivo + file, `${pathActivo}E-${file}`);
	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al elimiar las imagenes' }
	}
}

const bufferSoportespdf = (soportes, data) => {
	const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
	let bufferpdf={}
	for (let soporte in soportes) {
		const imagePath = pathActivo + soportes[soporte]
		const buffer = fs.readFileSync(imagePath);
		bufferpdf[soporte] = `data:${mime.lookup(soportes[soporte])};base64,${buffer.toString('base64')}`
	};
	return bufferpdf
}

const guadarReporteFinal =async (bufferPdf, data, id) =>{
	const pathReporte = path + data.siglas + '\\' + data.codigo +'\\' + id +'.pdf'
	try {
		var buf = Buffer.from(bufferPdf, 'base64')
		await fspromises.writeFile(pathReporte, buf)
		return 1
	} catch (error) {
		comsole.log(error)
		return 0
	}

}

const bufferReporte = (data, id) => {
	const pathSoporte = `${path}${data.siglas}\\${data.codigo}\\${id}.pdf`
		const buffer = fs.readFileSync(pathSoporte);
		return`data:application/pdf;base64,${buffer.toString('base64')}`
}



export {
	copiarYCambiarNombre,
	guardarImagenesNuevoActivo,
	bufferimagenes,
	elimnarImagenes,
	eliminarCarpetaActivo,
	elimnarImagenesSoliRepor,
	guardarPDF,
	bufferSoportespdf,
	elimnarSoportePdf,
	guadarReporteFinal,
	bufferReporte
}