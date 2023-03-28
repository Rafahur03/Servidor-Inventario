import formidable from "formidable"
import mime from 'mime-types'
import fs from 'fs'

import { consultarActivos } from "../db/sqlActivos.js"
import { validarDatosActivo } from "../helpers/validarDatosActivo.js"
import { desencriptarJson } from "../helpers/encriptarData.js"
import { gudardarNuevoActivo, guardarImagenes } from "../db/sqlActivos.js"

const consultarActivosTodos = async (req, res) => {
    const listadoActivos = await consultarActivos()
    res.json(listadoActivos)
}

const crearActivo = async (req, res) => {

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

        // valida el token y si el usuario tiene permisos para realozar la operacion
        const token = data.token
        const dataUsuarioSesion =  desencriptarJson(token)
        
        // anexamos los datos de create by, fecha de creacion
        data.create_by = dataUsuarioSesion.id
        const hoy = new Date(Date.now())
        data.fecha_creacion = hoy.toLocaleDateString()

        // guardamos los datos en la bd y devolvemos el codigo el id y el tipo de activo
        //const dataActivo = await gudardarNuevoActivo(data)
        //anexamos los datos de codigo
        const dataActivo = {
            codigo: 'IN0002',
            siglas:'IN',
            id: 1000
        }
   
        data.codigo = dataActivo.codigo
        data.id= dataActivo.id

       /// path fijo para gardar y distriuit las arhivos a guardar en el servidor
        const destinoPath = 'G:\\Mi unidad\\Sistema de Gestión de Calidad COS en revision y actualizacion\\IMPLEMENTACIÓN\\2020\\GESTION DE INFRAESTRUCTURA\\Inventario\\'+ dataActivo.siglas + '\\' + dataActivo.codigo + '\\' 

        // verificar si la ruta existe ni no se crean las carpetas
        if(!fs.existsSync(destinoPath)){
            fs.mkdirSync(destinoPath,{recursive:true});
        }

        // copiar las imagenes a la carpeta de destino
        let url_img=[]

        files.Image.forEach((image, index)=>{
            fs.copyFileSync(image.filepath, destinoPath + dataActivo.codigo + '-' + index + '.' + mime.extension(image.mimetype))

            url_img[index] = dataActivo.codigo + '-' + index + '.' + mime.extension(image.mimetype)
            
        })

        // guardar el listado de images en la base de datos
    //    const guardadoExitoso= await guardarImagenes(url_img. toString(), dataActivo.id)
    // if(guardadoExitoso.msg){
    //     res.json({msg: 'los datos se guardaron correctamente, pero hubo un error al guardar las imagenes '})
    // }
        // agregar a data el listado de imagenes

        //preparar respuesta enviando las imagenes y la informacion den nuevo activo
        delete data.token
        data.url_img= url_img

        const imageBuffers = url_img.map(imageName => {
            const imagePath = destinoPath + imageName
            return fs.readFileSync(imagePath);
          });

          // enviar respuesta con los datos del activo 
        res.json({
            data,
            images: imageBuffers.map((buffer,index) => `data:${mime.lookup(url_img[index])};base64,${buffer.toString('base64')}`)
        })
        
    });
}

const actualizarActivo = async (req, res) => {
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
        res.json(data )

    })

}


export{     
    consultarActivosTodos,
    crearActivo,
    actualizarActivo
}

