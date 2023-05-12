import { validarDatosUsuarios, validarUsuarioCreado } from "../helpers/validarDatosUsuario.js"
import { encryptPassword, validarPassword } from "../helpers/hashpasswords.js"
import { encriptarJson} from "../helpers/encriptarData.js"
import { consultarDataUsuario, guardarUsuario, actualizarUsuario, guardarToken } from "../db/sqlUsuarios.js"
import { json } from "express"

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
    const hoy = new Date(Date.now())
    const fecha = hoy.toLocaleDateString
    const dataToken ={
        id:idUsuario.id,
        fechaexpiracion: fecha,
        
    } 
     // devolver datos de inicio de sesion
    const token = encriptarJson(dataToken)
    const tokenGuardado = await guardarToken(token, idUsuario.id)
    if(tokenGuardado.msg) {
        res.json(tokenGuardado)
        return
    }
    res.json({
        token,
        data:{
            nombre: tokenGuardado.nombreUsuario,
            permisos: tokenGuardado.permisos,
            proveedores: tokenGuardado.proveedores,
            estado: tokenGuardado.estado,
            id: tokenGuardado.id
        }
    })
}


// create new user
const crearUsuario = async(req, res) => {

    // validar si tiene o no permisos para crear usuario
    const permisos = req.permisos
    const arrPermisos = JSON.parse(permisos)

    if (arrPermisos.indexOf(1) === -1) {
        res.json({msg: 'Usted no tiene permisos para crear usuarios'})
        return
    }

    if (req.sessionid !== req.body.createby) {
        res.json({msg: 'Error en el id de usuario de creacion'})
        return
    }

    // validation user exists
    const validacion =  await validarDatosUsuarios(req.body)
    if(validacion.msg !== 'validado'){
        res.json(validacion)
        return  
    }

     //encriptar password
    const hash = await encryptPassword(req.body.password)
    req.body.password = hash

    const hoy = new Date(Date.now())
    const fecha = hoy.toLocaleDateString
    req.body.date_create = fecha

    delete req.body.confirmarPassword

    res.json(req.body)
  
    /// agregar crear usuario con req. body para enviar los datos del usuario a la base de datos
   const usuarioCreado = guardarUsuario(req.body)
    if(usuarioCreado.msg){
        res.json(usuarioCreado)
    }
    res.json({msg:'Usuario creado satisfactoriamente'})
}

// actualiza datos de usuario.
const actualizaUsuario = async(req, res) => {
    const {sessionid, permisos} = req
    const dataUsuarioActualizar = req.body
    const arrPermisos = JSON.parse(permisos)

    if(sessionid !== dataUsuarioActualizar.id) {
        if (arrPermisos.indexOf(2) === -1) {
            return res.json({msg: 'Usted no tiene permisos para Actualizar usuarios'})
        }
    }else{
        // verificar que no se este modificando el documento o el correo
        const dataUsuarioDb = await consultarDataUsuario(dataUsuarioActualizar.id)
        if(dataUsuarioDb.numero_id !== dataUsuarioActualizar.numero_id || dataUsuarioDb.email !== dataUsuarioActualizar.email.toLowerCase()){

            if (arrPermisos.indexOf(2) === -1) {
                return res.json({msg: 'Usted no tiene permisos para el numero de documento y correo de usuarios'})
            }
        }      
    }
    
    // comporar por medio de contaseña que es en realidad el usuario quien desea actualizar los datos 
    const validacionPassword  = await validarPassword(dataUsuarioActualizar.passWordUsuarioSesion, sessionid)

    if(validacionPassword.msg){
        res.json(validacionPassword)
        return  
    }

    if(!validacionPassword){
        res.json({msg: 'Password incorrecto'})
        return
    }

    delete dataUsuarioActualizar.passWordUsuarioSesion
    // validar si se va  actulizar la contraseña.
    let validarNuevopassword = true
    if(!dataUsuarioActualizar.password){
         validarNuevopassword = false
    }

    // validar que los datos esten correctos
    const validacionDatosActualizar= await validarDatosUsuarios(dataUsuarioActualizar, validarNuevopassword )
    
    if(validacionDatosActualizar.msg !== 'validado'){
       res.json(validacionDatosActualizar)
        return  
    }
    
    //hahsear la nueva contraseña
    if(validarNuevopassword){
        const hash = await encryptPassword(dataUsuarioActualizar.password)
        dataUsuarioActualizar.password = hash
        delete dataUsuarioActualizar.confirmarPassword
    }

    // Normalizar datos para ingresar a la base de datos
    dataUsuarioActualizar.email = dataUsuarioActualizar.email.toLowerCase()

    dataUsuarioActualizar.tipo_id = dataUsuarioActualizar.tipo_id.toUpperCase()

    dataUsuarioActualizar.nombre = dataUsuarioActualizar.nombre.charAt(0).toUpperCase() + dataUsuarioActualizar.nombre.toLowerCase().slice(1)

    dataUsuarioActualizar.nombre_1 = dataUsuarioActualizar.nombre_1.toLowerCase().charAt(0).toUpperCase() + dataUsuarioActualizar.nombre_1.toLowerCase().slice(1)

    dataUsuarioActualizar.apellido = dataUsuarioActualizar.apellido.toLowerCase().charAt(0).toUpperCase() + dataUsuarioActualizar.apellido.toLowerCase().slice(1)

    dataUsuarioActualizar.apellido_1 = dataUsuarioActualizar.apellido_1.toLowerCase().charAt(0).toUpperCase() + dataUsuarioActualizar.apellido_1. toLowerCase().slice(1)


    const usuarioActualizado = await actualizarUsuario(dataUsuarioActualizar)
    if(usuarioActualizado.msg){
        res.json(usuarioActualizado)
    }
    
    res.json(dataUsuarioActualizar)
}

export{ 
    iniciaSesion,
    crearUsuario,
    actualizaUsuario
} 