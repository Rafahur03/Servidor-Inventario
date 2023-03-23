import { validarExisteUsuario } from "../db/sqlUsuarios.js"

const regularEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const regularNumber = /^[0-9]+$/
const regularNombre = /^[a-zA-Z ]*$/g

const validarDatosUsuarios = async (datos, id) => {

    const { numero_id,
        email,
        tipo_id,
        nombre,
        nombre_1,
        apellido,
        apellido_1,
        password,
        confirmarPassword,
        estado,
        createby,
        Id_proveedores} = datos

    const emailLowerCase = email.toLowerCase()
    if (!regularEmail.test(emailLowerCase)) {
        return { msg: 'El Email Invalido'}
    }

    if (!regularNumber.test(numero_id)) {
        return {msg: 'Numero de documento invalid'}
    }

    const validacion = await validarExisteUsuario(numero_id, emailLowerCase)

    if (validacion.msg) {
        return validacion
    }
    
    if (validacion[0][0] && validacion[1][0]) { 

        if(typeof id === 'undefined') {
            return{ msg: 'El numero de identificacion y el email estan asociados a otro usuario'}
        }

        if (validacion[0][0].id !== id & validacion[1][0].id !== id){
            return{ msg: 'El numero de identificacion y el email que intenta actualizar estan asociados a otro usuario'}
        } 
    }

    if (validacion[0][0]) {

        if(typeof id === 'undefined') {
            return{ msg: 'El numero de identificacion estan asociados a otro usuario'}
        }

        if(validacion[0][0].id !== id){
            return{ msg: 'El numero de identificacion que intenta actualizar esta asociado a otro usuario'}
        }
    }

    if (validacion[1][0]) {
        if(typeof id === 'undefined') {
            return{ msg: 'El el email estan asociados a otro usuario'}
        }

        if(validacion[0][0].id !== id){
            return{ msg: 'El email que intenta actualizar esta asociado a otro usuario'}
        }
    }
   
    if (nombre.trim() == "") {
        return{ msg: 'El primer nombre es obligatorio'}
    }
   
    if (!regularNombre.test(nombre.trim())) {
        return{ msg: 'El primer nombre solo puede contener letras'}
    }

    if (nombre_1.trim() !== "") {
        if (regularNombre.test(nombre_1.trim())) {
            return{ msg: 'El segundo nombre solo puede contener letras'}
        }
    }
   
    if (apellido.trim() == "") {
        return{ msg: 'El primer apellido es obligatorio'}
    }

    if (!regularNombre.test(apellido.trim())) {
        return{ msg: 'El primer apellido solo puede contener letras'}
    }

    if (apellido_1.trim() == "") {
        return{ msg: 'El segundo apellido es obligatorio'}
    }

    if (regularNombre.test(apellido_1.trim())) {
        return{ msg: 'El segundo apellido solo puede contener letras'}
    }

    if (tipo_id == "") {
        return{ msg: 'Debe seleccionar un estado'}
    }

    if (estado == "") {
        return{ msg: 'Debe seleccionar un estado'}
    }
    if(password == "") {
        if (password.trim() == "") {
            return{ msg: 'La contraseña es obligatoria'}
        }
        
        if (password.trim().length < 6) {
            return{ msg: 'La contraseña debe tener almenos 5 caracteres'}
        }

        if (confirmarPassword.trim() == "") {
            return{ msg: 'Debe confirmar la contraseña'}
        }

        if (password !== confirmarPassword) {
            return{ msg: 'Las contraseñas no coinciden'}
        }
    }
    
    if (!Id_proveedores[0]) {
        return{ msg: 'Debe seleccionar al menos un Proveedor'}
    }

    return{ msg:'validado'}

}

const validarUsuarioCreado = async (usuario)=>{
    if (regularEmail.test(usuario)) {
        const validacion = await validarExisteUsuario("", usuario)
        if (validacion.msg) {
            return validacion
        }

        if(validacion[1][0].estado != 1) {
            return{ msg: 'El usuario esta inactivo'}
        }
        return validacion[1][0]
    }

    if (regularNumber.test(usuario)) {
        const validacion = await validarExisteUsuario(usuario, "")
        if (validacion.msg) {
            return validacion
        }

        if(validacion[0][0].estado != 1) {
            return{ msg: 'El usuario esta inactivo'}
        }
        return validacion[0][0]
    }
    
     return{ msg: 'debe ingresar un email o un numero de id para poder iniciar sesion'}
}

export {validarDatosUsuarios,
    validarUsuarioCreado}