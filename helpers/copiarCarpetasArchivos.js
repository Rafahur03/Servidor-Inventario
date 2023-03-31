import { promises as fs } from 'fs' ; // Importa el módulo fs con promesas
import mime from 'mime-types'

const copiarYCambiarNombre = async  (data)=> {
  try {
    
    const {siglaAntigua, siglaNueva, codigoAntiguo, codigoNuevo} = data

    const path = process.env.PATH_FILES
    //Cambiar ubicacion y nombre de una carpeta
    await fs.rename(`${path}\\${siglaAntigua}\\${codigoAntiguo}`, `${path}\\${siglaNueva}\\${codigoNuevo}`);
    // cambia los nombres de los archivos al nuevo codigo

    const carpeta = `${path}\\${siglaNueva}\\${codigoNuevo}`
    const url_img =[]
    const extenciones = ['jpg', 'png', 'jpeg']
    const archivos = await fs.readdir(carpeta);
    const promesasRenombramiento = archivos.map((archivo, indice) => {
        const nuevoNombre = archivo.replace(codigoAntiguo, codigoNuevo)
        const viejoNombre = `${carpeta}/${archivo}`;
        const nuevoNombreCompleto = `${carpeta}/${nuevoNombre}`;
        const tipo = mime.extension(mime.lookup(nuevoNombre))
        if(extenciones.includes(tipo)) { 
            url_img.push(nuevoNombre);
        }
      
    return fs.rename(viejoNombre, nuevoNombreCompleto);

    });
    ;
    await Promise.all(promesasRenombramiento);
   return url_img

} catch (error) {
    console.error(`Ha ocurrido un error: ${error.message}`);
    return{msg:'error al guardar las imagenes'}
  }
}

export {copiarYCambiarNombre}