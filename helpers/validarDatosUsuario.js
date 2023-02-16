import { validarExisteUsuario } from "../db/sqlUsuarios.js"

const validarDatosUsuarios = async datos => {

    const regularEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    const regularNumber = /^(\d+|\d+|\d+|\d*\d*[Ee][+-]?\d*)$/gm
    const regularNombre = /^[A-Z]/i
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

    if (!regularEmail.test(email)) {
        return { msg: 'El Email Invalido'}
    }

    if (!regularNumber.test(numero_id)) {
        return {msg: 'Numero de documento invalid'}
    }

    const validacion = await validarExisteUsuario(numero_id, email)

    if (validacion.msg) {
        return validacion
    }

    if (validacion[0][0] && validacion[1][0]) {
        return{ msg: 'El numero de identificacion y el email ya existen'}
    }

    if (validacion[0][0]) {
        return{ msg: 'El numero de identificacion del usuario ya existe'}
    }

    if (validacion[1][0]) {
        return{ msg: 'El Email del usuario ya existe'}
    }
    
    if (nombre.trim() == "") {
        return{ msg: 'El primer nombre es obligatorio'}
    }
    console.log(nombre)
    if (regularNombre.test(nombre.trim())) {
        return{ msg: 'El primer nombre solo puede contener letras'}
    }

    if (regularNombre.test(nombre_1.trim())) {
        return{ msg: 'El segundo nombre solo puede contener letras'}
    }

    if (apellido.trim() == "") {
        return{ msg: 'El primer apellido es obligatorio'}
    }
    if (regularNombre.test(apellido.trim())) {
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

    if (password.trim() == "") {
        return{ msg: 'La contraseña es obligatoria'}
    }

    if (password.trim().length() < 6) {
        return{ msg: 'La contraseña debe tener almenos 5 caracteres'}
    }

    if (confirmarPassword.trim() == "") {
        return{ msg: 'Debe confirmar la contraseña'}
    }

    if (password !== confirmarPassword) {
        return{ msg: 'Las contraseñas no coinciden'}
    }

    if (!Id_proveedores[0]) {
        return{ msg: 'Debe seleccionar al menos un Proveedor'}
    }

    return{ msg:'validado'}

}

export default validarDatosUsuarios 