import formidable from "formidable"
import mime from 'mime-types'
import fs from 'fs'
import { consultarActivos } from "../db/sqlActivos.js"
import { validarDatosActivo } from "../helpers/validarDatosActivo.js"
import { desencriptarJson } from "../helpers/encriptarData.js"
import { gudardarNuevoActivo } from "../db/sqlActivos.js"

const consultarActivosTodos = async (req, res) => {
    const listadoActivos = await consultarActivos()
    res.json(listadoActivos)
}

const crearActivo = async (req, res) => {

    const form = formidable({ multiples: true });

    form.parse(req, async function (err, fields, files) {
        if (err) {
            console.error(err); 
            return res.status(500).json({ error: err });
        }

        const data = JSON.parse(fields.data) 
        const validacion = await validarDatosActivo(data)
        if(validacion.msg){
            res.json(validacion)
        }
        const token = data.token
        const dataUsuarioSesion =  desencriptarJson(token)
        data.create_by = token.id
        const hoy = new Date(Date.now())
        data.fecha_creacion = hoy.toLocaleDateString()
        //const dataActivo = await gudardarNuevoActivo(data)
        const dataActivo = data
        data.siglas = "IN"
        data.codigo = 'IN0002'
        const destinoPath = 'G:\\Mi unidad\\Sistema de Gestión de Calidad COS en revision y actualizacion\\IMPLEMENTACIÓN\\2020\\GESTION DE INFRAESTRUCTURA\\Inventario\\'+ dataActivo.siglas + '\\' + dataActivo.codigo + '\\' 

        if(!fs.existsSync(destinoPath)){
            fs.mkdirSync(destinoPath,{recursive:true});
        }
        files.Image.forEach((image, index)=>{
            fs.copyFileSync(image.filepath, destinoPath + dataActivo.codigo + '-' + index + '.' + mime.extension(image.mimetype))
            let url_img=[]
            //let a = url_img.push(dataActivo.codigo + '-' + index + '.' + mime.extension(image.mimetype))
            url_img[index] = dataActivo.codigo + '-' + index + '.' + mime.extension(image.mimetype)
            console.log(url_img, index)
        })

        res.json(dataActivo)
        
    });
}

export{     
    consultarActivosTodos,
    crearActivo
}

