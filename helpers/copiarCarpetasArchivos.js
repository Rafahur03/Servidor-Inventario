import { promises as fspromises } from 'fs'; // Importa el módulo fs con promesas
import fs from 'fs'
import mime from 'mime-types'


const path = process.env.PATH_FILES

const copiarYCambiarNombre = async (data) => {
	try {

		const { siglaAntigua, siglaNueva, codigoAntiguo, codigoNuevo } = data


		//Cambiar ubicacion y nombre de una carpeta
		await fspromises.rename(`${path}\\${siglaAntigua}\\${codigoAntiguo}`, `${path}\\${siglaNueva}\\${codigoNuevo}`);
		// cambia los nombres de los archivos al nuevo codigo

		const carpeta = `${path}\\${siglaNueva}\\${codigoNuevo}`
		const url_img = []
		const extenciones = ['jpg', 'png', 'jpeg']
		const archivos = await fspromises.readdir(carpeta);

		const promesasRenombramiento = archivos.map((archivo) => {
			const nuevoNombre = archivo.replace(codigoAntiguo, codigoNuevo)
			const viejoNombre = `${carpeta}/${archivo}`;
			const nuevoNombreCompleto = `${carpeta}/${nuevoNombre}`;
			const tipo = mime.extension(mime.lookup(nuevoNombre))
			if (extenciones.includes(tipo)) {
				url_img.push(nuevoNombre);
			}

			return fspromises.rename(viejoNombre, nuevoNombreCompleto);

		});

		await Promise.all(promesasRenombramiento);
		return url_img

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al guardar las imagenes' }
	}
}

const guardarImagenesNuevoActivo = async (files, data) => {

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}	

	try {
		const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`

		try {
			await fspromises.access(pathActivo, fspromises.constants.F_OK);
		} catch (error) {
			await fspromises.mkdir(pathActivo);
			console.log(`Carpeta ${pathActivo} creada.`);
		}

		// copia las imagenes a las carptea del activo
		const url_img = []
		// verificamos si es una o mas de una imagen. 
		const dimension = files.Image.length
		const tipo = typeof dimension  === undefined
	
		if (!tipo) {
				const promesasDeCopia = files.Image.map(async file => {
				const pathOrigen = file.filepath
				const nuevoNombre = `${data.codigo}-${Date.now()}${getRandomInt(100)}.${mime.extension(file.mimetype)}`
				const pathDestino = `${pathActivo}${nuevoNombre}`
				url_img.push(nuevoNombre)
				await fspromises.copyFile(pathOrigen, pathDestino);
			})
			await Promise.all(promesasDeCopia);

			// elimina nos archivos temporales 
			const promesasEliminar = files.Image.map(async file => {
				const pathOrigen = file.filepath
				await fspromises.unlink(pathOrigen);
			})
			await Promise.all(promesasEliminar);

		} else {
			const pathOrigen = files.Image.filepath
			const nuevoNombre = `${data.codigo}-${Date.now()}${getRandomInt(100)}.${mime.extension(files.Image.mimetype)}`
			const pathDestino = `${pathActivo}${nuevoNombre}`
			url_img.push(nuevoNombre)
			await fspromises.copyFile(pathOrigen, pathDestino)
			await fspromises.unlink(pathOrigen)
		}
		return url_img

	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'error al guardar las imagenes' }
	}
}

const bufferimagenes = (url_img, data) => {

	const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
	const imageBuffers = url_img.map(imageName => {
		const imagePath = pathActivo + imageName
		const buffer = fs.readFileSync(imagePath);
		const bufferCompleto = `data:${mime.lookup(imageName)};base64,${buffer.toString('base64')}`
		return bufferCompleto
	});
	return imageBuffers
}

const elimnarImagenes = async (files, data) => {
	
	try {
		const pathActivo = `${path}${data.siglas}\\${data.codigo}\\`
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
		const {siglas, codigo} = data
		//renonbrar carpeta 
		await fspromises.rename(`${path}\\${siglas}\\${codigo}`, `${path}\\${siglas}\\${codigo}-E`)
		
	} catch (error) {
		console.error(`Ha ocurrido un error: ${error.message}`);
		return { msg: 'Error al intentat eliminar la carpeta del activo' }
	}
}

export {
	copiarYCambiarNombre,
	guardarImagenesNuevoActivo,
	bufferimagenes,
	elimnarImagenes,
	eliminarCarpetaActivo

}