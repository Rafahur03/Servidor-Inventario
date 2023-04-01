import formidable from "formidable"
import mime from 'mime-types'
import fs from 'fs'

import { consultarActivos } from "../db/sqlActivos.js"
import { validarDatosActivo } from "../helpers/validarDatosActivo.js"
import { copiarYCambiarNombre,
         guardarImagenesNuevoActivo,
         bufferimagenes  } from "../helpers/copiarCarpetasArchivos.js"
import { 
    gudardarNuevoActivo,
    guardarImagenes,
    consultarCodigoInterno,
    actualizarActivoDb,
    consultarCalsificacionActivoMod,
    actualizarClasificacion } from "../db/sqlActivos.js"


const consultarActivosTodos = async (req, res) => {
    const listadoActivos = await consultarActivos()
    res.json(listadoActivos)
}

const crearActivo = async (req, res) => {

    // validar permisos para crear activos
    const {sessionid, permisos} = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({msg: 'Usted no tiene permisos para crear Activos'})
    }

    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {
        
        if (err) {
            console.error(err); 
            return res.status(500).json({ error: err });
        }        
        // extrae los datos del req y valida que esten normalizados para ingreso a la bd
        const data = JSON.parse(fields.data) 
        const validacion = await validarDatosActivo(data)

        if(validacion.msg){
            res.json(validacion)
        }
                
        // anexamos los datos de create by, fecha de creacion
        data.create_by = sessionid
        const hoy = new Date(Date.now())
        data.fecha_creacion = hoy.toLocaleDateString()

        // guardamos los datos en la bd y devolvemos el codigo el id y el tipo de activo
       const dataActivo = await gudardarNuevoActivo(data)
       if(dataActivo.msg){
        return res.json(dataActivo)
       }

        
       //anexamos los datos de codigo
       data.codigo = dataActivo.codigo
       data.id= dataActivo.id

       // guarda las imagenes en la ruta perteneciente al activo y devolver los nombres de la imagenes

        const url_img =  await guardarImagenesNuevoActivo(files, dataActivo)
        if(url_img.msg){
            return res.json(url_img)
        }

        data.url_img = url_img
 
        // guardar el listado de images en la base de datos
        const guardadoExitoso= await guardarImagenes(url_img.toString(), data.id)
        if(guardadoExitoso.msg){
           res.json({msg: 'los datos se guardaron correctamente, pero hubo un error al guardar las imagenes '})
        }
      
        //optener un buffer de las imagenes 
        const Imagenes = bufferimagenes(url_img, dataActivo)

          // enviar respuesta con los datos del activo 
        res.json({
            data,
            Imagenes
        })
        
    });
}

const actualizarActivo = async (req, res) => {

    const {sessionid, permisos} = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(3) === -1) {
        return res.json({msg: 'Usted no tiene permisos para Actualizar Activos'})
    }
    // usa  formidable para recibir el req de imagenes y datos
    const form = formidable({ multiples: true });
    form.parse(req, async function (err, fields, files) {
        
        if (err) {
            console.error(err); 
            return res.status(500).json({ error: err });
        }
        // extrae los datos del req 
        const data = JSON.parse(fields.data) 

        //validar que el id corresponde al codigo interno del equipo
        const codigoInternoDb =  await consultarCodigoInterno(data.id)
        
        if(codigoInternoDb.codigo !== data.codigo){
            return res.json({msg: 'El Id del activo no corresponde al codigo interno no se puede actualizar los datos'})
        }

        // validar si se elimino alguna imagen
        if(data.url_img.length <=0 && !files.Image){
            return res.json({msg: 'No se puede eliminar todas las imagenes'})
        }

        let imageneDb = codigoInternoDb.url_img.split(',')
        const ElminoImagen = JSON.stringify(imageneDb) === JSON.stringify(data.url_img)

        // crea un nuevo arreglo con losnombres de las imagenes
        let nuevaUrl_imag
        let imagenesEliminar

        if(ElminoImagen){
            nuevaUrl_imag = imageneDb
        }else{  
            nuevaUrl_imag = imageneDb.filter(image => data.url_img.includes(image))
            imagenesEliminar = imageneDb.filter(image => !data.url_img.includes(image))
        }
        // valida que esten normalizados para ingreso a la bd
        const validacion = await validarDatosActivo(data, true)
        if(validacion.msg){
            return res.json(validacion)
        }
        // verificar si existen imagenes guardarlas y actualizar la bd
        const destinoPath = 'G:\\Mi unidad\\Sistema de Gestión de Calidad COS en revision y actualizacion\\IMPLEMENTACIÓN\\2020\\GESTION DE INFRAESTRUCTURA\\Inventario\\'+ codigoInternoDb.siglas + '\\' + codigoInternoDb.codigo + '\\' 

        if(files.Image){
            let url_img=[]
            files.Image.forEach((image, index)=>{
                fs.copyFileSync(image.filepath, destinoPath + codigoInternoDb.codigo + '-' + Date.now() + '.' + mime.extension(image.mimetype))
                url_img[index] = dataActivo.codigo + '-' + index + '.' + mime.extension(image.mimetype)  
            })
            nuevaUrl_imag.concat(url_img)
        }

        if(imagenesEliminar.length > 0) {
            imagenesEliminar.forEach( image =>{
                fs.unlinkSync(destinoPath + image)
            }) 
        }

        data.url_img = nuevaUrl_imag
        // actualizar activo en bd
        const actualizar = await actualizarActivoDb(data)
        if (actualizar.msg){
            return res.json(actualizar)
        }
        // devolver los nuevos datos del activo y las imagenes
        const imageBuffers = data.url_img.map(imageName => {
            const imagePath = destinoPath + imageName
            return fs.readFileSync(imagePath);
          });

          // enviar respuesta con los datos del activo e imagenes
        res.json({
            msg:'Activo actualizado correctamente',
            data,
            images: imageBuffers.map((buffer,index) => `data:${mime.lookup(data.url_img[index])};base64,${buffer.toString('base64')}`)
        })

    })

}

const cambiarClasificacion = async (req, res) => {

    // verifica si tiene permios para camiar la clasificacion
    const {sessionid, permisos} = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(4) === -1) {
        return res.json({msg: 'Usted no tiene permisos para Actualizar Activos'})
    }

    const data = req.body

    // consulta y verifica que la calsificacion actual sea diferente a la nueva
    const datosDb = await  consultarCalsificacionActivoMod(data.id, data.nuevaClasificacion)
    const clasificacionActual = datosDb[0][0]
  
    if (clasificacionActual.clasificacionActual === data.nuevaClasificacion){
        return res.json({msg:'El activo pertenea la clasificacion seleccionada'})
    }

    // verificar que exista la clasificacion
    if(!datosDb[1][0]){
        return res.json({msg:'Debe seleccionar una clasificacion del listado'})
    }
    const clasificacionNueva = datosDb[1][0].existe

    // Busca el codigo del ultimo activo de la clasificacion y lo incrementa en 1
    const consecutivo = datosDb[2][0].consecutivo_interno
    const aumento = parseInt(consecutivo) + 1
    const consecutivo_interno = aumento.toString().padStart(4, 0)

    // actualiza los datos de la nueva clasificacion en la bd
    const actualizado = actualizarClasificacion(data.id, clasificacionNueva, consecutivo_interno )
    if(actualizado.msg){
        return res.json(actualizado);
    }

    // consulta el nuevo codigo interno del activo y las nuevas siglas 
    const nuevoCodigoInterno = await consultarCodigoInterno(data.id)

    // copiar la carpeta, renombrarla y copiar los archivos

    const datafile={
        siglaAntigua:clasificacionActual.siglaActual,
        siglaNueva:nuevoCodigoInterno.siglas ,
        codigoAntiguo: clasificacionActual.codigoActual,
        codigoNuevo: nuevoCodigoInterno.codigo
    }

    const url_img = await copiarYCambiarNombre(datafile)
    if(url_img.msg){
        return request.json(url_img)
    }
    console.log(url_img)
    const guardar  = await guardarImagenes(url_img.toString(), data.id)
    if(guardar.msg){
        return res.json(guardar)
    }
    
    res.json({codigoInterno: nuevoCodigoInterno.codigo})
   
}

const eliminarActivo = async (req, res) => {
    const {sessionid, permisos} = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(4) === -1) {
        return res.json({msg: 'Usted no tiene permisos para eliminar Activos'})
    }

    const data = req.body

    const codigointerno =  await consultarCodigoInterno(data.id)
    if (codigointerno.codigo !== data.codigo) {
        return res.json({msg: 'El codigo ingresado no coincide con el codigo del activo'})
    }

    res.json({data}  )
}

export{     
    consultarActivosTodos,
    crearActivo,
    actualizarActivo,
    cambiarClasificacion,
    eliminarActivo
}

