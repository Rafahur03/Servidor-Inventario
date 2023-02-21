import { validarDatosUsuarios, validarUsuarioCreado } from "../helpers/validarDatosUsuario.js"
import { encryptPassword, validarPassword } from "../helpers/hashpasswords.js"
import { encriptarJson, desencriptarJson } from "../helpers/encriptarData.js"
import { consultarDataUsuario } from "../db/sqlUsuarios.js"

const iniciaSesion = async (req, res) => {

    const {usuario, password} = req.body

    //validar usuario  existe
    const idUsuario =  await validarUsuarioCreado(usuario)
    if(idUsuario.msg){
        res.json(idUsuario)
        return  
    }

    //check password
    const validacionPassword  = await validarPassword(password, idUsuario.id)
    
    if(validacionPassword.msg){
        res.json(validacionPassword)
        return  
    }

    if(!validacionPassword){
        res.json({msg: 'Password incorrecto'})
        return
    }

    // consultar datos del usuario
    const {id, nombre, nombre_1, apellido, apellido_1, Id_proveedores} = await consultarDataUsuario(idUsuario.id)

    // devolver datos de inicio de sesion
    res.json(encriptarJson({id, nombre, nombre_1, apellido, apellido_1, Id_proveedores}))
}


const crearUsuario = async(req, res) => {

    // validation user exists
    const validacion =  await validarDatosUsuarios(req.body)
    if(validacion.msg !== 'validado'){
        res.json(validacion)
        return  
    }

    //encriptar password
    const hash = await encryptPassword(req.body.password)
    req.body.password = hash

    /// agregar crear usuario con req. body para enviar los datos del usuario a la base de datos
    res.json({hola:'creando Usuario'})

}

const actualizaUsuario = async(req, res) => {
   const {token} = req.body
   // validar token para conocer el usuario que realiza la actualización.
   res.json(desencriptarJson(token))

}

export{ 
    iniciaSesion,
    crearUsuario,
    actualizaUsuario
} 