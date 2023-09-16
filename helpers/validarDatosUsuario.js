import { validarExisteUsuario } from "../db/sqlUsuarios.js"

const regularEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const regularNumber = /^[0-9]+$/
const regularNombre = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s']*$/u

const validarDatosUsuarios = async (datos, validarPassword = true) => {

       // validar email
    const emailLowerCase = datos.email.toLowerCase()

    if (!regularEmail.test(emailLowerCase)) return { msg: 'El Email es Invalido' }

    if (validarVacios(datos.email)) return { msg: 'El campo Email no puede estar vacio' }

    if (validarCaracteres(datos.email)) return { msg: 'El campo Email no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.email)) return { msg: 'El campo Email no puede contener palabaras como Select, from, Insert, ect..' }

    const regex = /^[^@]+@[^@]+\.[a-zA-Z]+$/;
    if (!regex.test(datos.email)) return { msg: 'El Email es Invalido' }

    // validar documento 

    if (!regularNumber.test(datos.numeroDocumento)) return { msg: 'Numero de documento invalido' }
    if (validarVacios(datos.numeroDocumento)) return { msg: 'El campo numero de documento no puede estar vacio' }

    if (parseInt(datos.numeroDocumento) == NaN) return { msg: 'El campo numero de documento solo puede contener letras' }

    const validacion = await validarExisteUsuario(datos.numeroDocumento, emailLowerCase)

    if (validacion.msg) {
        return validacion
    }

    if (validacion[0][0] && validacion[1][0]) {
        console.log('aqui 1')
        
        return { msg: 'El numero de identificacion y el email estan asociados a otro usuario' }
    }   
    if (validacion[0][0]) {
        console.log('aqui 2')
        return { msg: 'El numero de identificacion estan asociados a otro usuario' }
    }
    if (validacion[1][0]){ 
        
        console.log('aqui 3')
        return { msg: 'El Email estan asociados a otro usuario' }}

    if (validarVacios(datos.tipoId) || validarCaracteres(datos.tipoId) || validarPalabras(datos.tipoId) || datos.tipoId.length > 2) return { msg: 'Debe escoger un tipo de identificacion del listado' }

    if (validarVacios(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede estar vacio' }

    if (validarCaracteres(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede contener palabaras como Select, from, Insert, ect..' }

    if (!regularNombre.test(datos.primerNombre.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

    if (validarCaracteres(datos.segundoNombre)) return { msg: 'El campo segundo Nombre no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.segundoNombre)) return { msg: 'El campo segundo Nombre no puede contener palabaras como Select, from, Insert, ect..' }

    if (datos.segundoNombre.length > 0) {
        if (datos.segundoNombre.trim().length > 0) {
            if (!regularNombre.test(datos.primerNombre.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }
        }
    }

    if (validarVacios(datos.primerApellido)) return { msg: 'El campo Primer Apellido no puede estar vacio' }

    if (validarCaracteres(datos.primerApellido)) return { msg: 'El campo Primer Apellido no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.primerApellido)) return { msg: 'El campo Primer Apellido no puede contener palabaras como Select, from, Insert, ect..' }

    if (!regularNombre.test(datos.primerApellido.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

    if (validarVacios(datos.segundoApellido)) return { msg: 'El campo Segundo Apellido no puede estar vacio' }

    if (validarCaracteres(datos.segundoApellido)) return { msg: 'El campo Segundo Apellido no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.segundoApellido)) return { msg: 'El campo Segundo Apellido no puede contener palabaras como Select, from, Insert, ect..' }

    if (!regularNombre.test(datos.segundoApellido.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

    if (validarPassword) {

        if (!datos.contraseña) {
            return { msg: 'debe ingresar una contraseña' }
        }

        if (!datos.confirmarContraseña) {
            return { msg: 'El campo confirmar Comtraseña es obligatorio' }
        }

        if (validarVacios(datos.contraseña)) return { msg: 'El campo Contraseña no puede estar vacio' }

        if (datos.contraseña.includes(' ')) return { msg: 'El campo Contraseña no puede contener espacios' }

        if (datos.contraseña.length < 6) {
            return { msg: 'La contraseña debe tener almenos 5 caracteres' }
        }

        if (datos.contraseña !== datos.confirmarContraseña) return { msg: 'Las contraseñas no conciden' }

    }

    if (typeof datos.usuarios !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Usuarios' }

    if (typeof datos.activos !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Activos' }

    if (typeof datos.solicitudes !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Solicitudes' }

    if (typeof datos.reportes !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Reportes' }

    if (typeof datos.confguraciones !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Configuraciones' }
    
    if (typeof datos.clasificacion !== "boolean") return { msg: 'Debe Selecioar un estado de la opcion permisos para el menu Cambiar clasificacion activos' }

    if (datos.proveedores.length == 0) return modalMensaje({ titulo: 'ERROR', mensaje: 'El usuario debe estar asociado al menos un porveedor' })
    
    const validarproveedor = datos.proveedores.map(item => {
        if (validarId(item)) return true
        return false
    })

    if (validarproveedor.some(elemento => elemento === true)) return { msg: 'todos los proveedores deben ser escogidos del listado' }

    if (!datos.firma) return { msg: 'Debe cargar obligatoriamente una firma' }

    return true

}

const validarVacios = dato => {
    if (dato.includes('')) {
        if (dato.trim() == '') return true
    } else {
        if (dato == '') return true
    }
    return false
}

const validarCaracteres = dato => {
    if (dato.includes('{') || dato.includes('}') || dato.includes('(') || dato.includes(')') || dato.includes('[') || dato.includes(']') || dato.includes('<') || dato.includes('>')) {
        return true
    }
    return false
}

const validarPalabras = dato => {
    if (dato.includes('select') || dato.includes('Select') || dato.includes('SELECT') || dato.includes('FROM') || dato.includes('From') || dato.includes('from') || dato.includes('insert') || dato.includes('Insert') || dato.includes('INSERT')) {
        return true
    }
    return false
}

const validarId = (datos) => {
    if (!datos.includes('-')) return true
    const id = parseInt(datos.split('-')[1])
    if (id == NaN) return true
    return false
}


const validarUsuarioCreado = async (usuario) => {
    if (regularEmail.test(usuario)) {
        const validacion = await validarExisteUsuario("", usuario)
        if (validacion.msg) {
            return validacion
        }

        if (validacion[1][0].estado != 1) {
            return { msg: 'El usuario esta inactivo' }
        }
        return validacion[1][0]
    }

    if (regularNumber.test(usuario)) {
        const validacion = await validarExisteUsuario(usuario, "")
        if (validacion.msg) {
            return validacion
        }

        if (validacion[0][0].estado != 1) {
            return { msg: 'El usuario esta inactivo' }
        }
        return validacion[0][0]
    }

    return { msg: 'debe ingresar un email o un numero de id para poder iniciar sesion' }
}

export {
    validarDatosUsuarios,
    validarUsuarioCreado
}