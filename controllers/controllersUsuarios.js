import validarDatosUsuarios from "../helpers/validarDatosUsuario.js"
import { encryptPassword } from "../helpers/hashpasswords.js"

const iniciaSesion = (req, res) => {
    res.json({hola:'Iniciando sesion'})
}

const crearUsuario = async(req, res) => {
    const validacion =  await validarDatosUsuarios(req.body)
    if(validacion.msg !== 'validado'){
        res.json(validacion)
        return
    }

    console.log(req.body.password)
    const hash = await encryptPassword(req.body.password)
    console.log(hash)
    res.json({hola:'creando Usuario'})
}

export{ 
    iniciaSesion,
    crearUsuario
} 