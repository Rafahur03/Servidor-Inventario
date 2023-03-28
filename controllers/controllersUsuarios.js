import { validarDatosUsuarios, validarUsuarioCreado } from "../helpers/validarDatosUsuario.js"
import { encryptPassword, validarPassword } from "../helpers/hashpasswords.js"
import { encriptarJson, desencriptarJson } from "../helpers/encriptarData.js"
import { consultarDataUsuario, guardarUsuario, actualizarUsuario } from "../db/sqlUsuarios.js"

// iniciar sesion 

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
    const dataUsuario = await consultarDataUsuario(idUsuario.id)
    const hoy = new Date(Date.now())
    const fecha = hoy.setDate(hoy.getDate() + 100) 
    dataUsuario.fechaexpiracion  = '25/12/2024'
    //hoy.toLocaleDate() + 100
    
     // devolver datos de inicio de sesion
    res.json(encriptarJson(dataUsuario))
}


// create new user
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
    const usuarioCreado = guardarUsuario(req.body)
    if(usuarioCreado.msg){
        res.json(usuarioCreado)
    }
    res.json({msg:'Usuario creado satisfactoriamente '})

}

// actualiza datos de usuario.
const actualizaUsuario = async(req, res) => {
    const {token, numero_id} = req.body

    ///validar los dato del token y si tiene permisos o es el mismo usuario qien desea actualziar los datos
    const dataUsuarioSesion =  desencriptarJson(token)
    if(dataUsuarioSesion.msg){
        res.json(dataUsuarioSesion)
        return
    }else{
        res.json(dataUsuarioSesion)
        return
    }
    const identificacionUsuarioSesion = await consultarDataUsuario(dataUsuarioSesion.id)
       if(identificacionUsuarioSesion.numero_id !== numero_id){
        if(identificacionUsuarioSesion.permisos !== 1){
            res.json({msg:'El usuario no tiene permisos para cambiar datos de otro usuario'})
            return
        }
    }

    // comporar por medio de contaseña que es en realidad el usuario quien desea actualizar los datos 
    const {passWordUsuarioSesion} = req.body
    const validacionPassword  = await validarPassword(passWordUsuarioSesion, dataUsuarioSesion.id)
    if(validacionPassword.msg){
        res.json(validacionPassword)
        return  
    }

    if(!validacionPassword){
        res.json({msg: 'Password incorrecto'})
        return
    }

    // validar que los datos esten correctos
    const validacionDatosActualizar= await validarDatosUsuarios(req.body, dataUsuarioSesion.id)
    
    if(validacionDatosActualizar.msg !== 'validado'){
       res.json(validacionDatosActualizar)
        return  
    }


    // que pasa con la contaseña
    if(req.body.password){
        const hash = await encryptPassword(req.body.password)
        req.body.password = hash
        delete req.body.confirmarPassword
        console.log('si')
    }
   
    // query update data
    delete req.body.token
    delete req.body.passWordUsuarioSesion
    req.body.email = req.body.email.toLowerCase()
    req.body.nombre = req.body.nombre.charAt(0).toUpperCase() + req.body.nombre.toLowerCase().slice(1)
    req.body.nombre_1 = req.body.nombre_1.toLowerCase().charAt(0).toUpperCase() + req.body.nombre_1.toLowerCase().slice(1)
    req.body.apellido = req.body.apellido.toLowerCase().charAt(0).toUpperCase() + req.body.apellido.toLowerCase().slice(1)
    req.body.apellido_1 = req.body.apellido_1.toLowerCase().charAt(0).toUpperCase() + req.body.apellido_1. toLowerCase().slice(1)

    const usuarioActualizado = await actualizarUsuario(req.body)
    if(usuarioActualizado.msg){
        res.json(usuarioActualizado)
    }
    
    res.json(usuarioActualizado)
}

export{ 
    iniciaSesion,
    crearUsuario,
    actualizaUsuario
} 