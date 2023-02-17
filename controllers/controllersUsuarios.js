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

     const hash = await encryptPassword(req.body.password)
    req.body.password = hash
    /// agregar crear usuario
    res.json({hola:'creando Usuario'})

}

export{ 
    iniciaSesion,
    crearUsuario
} 