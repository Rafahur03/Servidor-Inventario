import { validarExisteUsuario } from "../db/sqlUsuarios.js"
import { consultarProveedoresUsuarios } from "../db/sqlUsuarios.js"
import { encryptPassword } from "./hashpasswords.js"

const regularEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const regularNumber = /^[0-9]+$/
const regularNombre = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s']*$/u

const validarDatosUsuarios = async datos => {

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


        return { msg: 'El numero de identificacion y el email estan asociados a otro usuario' }
    }
    if (validacion[0][0]) {

        return { msg: 'El numero de identificacion estan asociados a otro usuario' }
    }
    if (validacion[1][0]) {

        return { msg: 'El Email estan asociados a otro usuario' }
    }

    if (validarVacios(datos.tipoId) || validarCaracteres(datos.tipoId) || validarPalabras(datos.tipoId) || datos.tipoId.length > 2) return { msg: 'Debe escoger un tipo de identificacion del listado' }

    if (validarVacios(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede estar vacio' }

    if (validarCaracteres(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede contener palabaras como Select, from, Insert, ect..' }

    if (!regularNombre.test(datos.primerNombre.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

    if (validarCaracteres(datos.segundoNombre)) return { msg: 'El campo segundo Nombre no puede contener caracteres como [], {}. <>, (), ect..' }

    if (validarPalabras(datos.segundoNombre)) return { msg: 'El campo segundo Nombre no puede contener palabaras como Select, from, Insert, ect..' }

    if (datos.segundoNombre.length > 0) {
        if (datos.segundoNombre.trim().length > 0) {
            if (!regularNombre.test(datos.segundoNombre.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }
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


    if (!datos.contraseña) {
        return { msg: 'debe ingresar una contraseña' }
    }

    if (!datos.confirmarContraseña) {
        return { msg: 'El campo confirmar Comtraseña es obligatorio' }
    }

    if (validarVacios(datos.contraseña)) return { msg: 'El campo Contraseña no puede estar vacio' }

    if (datos.contraseña.includes(' ')) return { msg: 'El campo Contraseña no puede contener espacios' }

    if (datos.contraseña.length < 6 || datos.contraseña.length > 16) return { msg:'La contraseña debe estar entre 6 y 16 caracteres'}
    
    if (datos.contraseña !== datos.confirmarContraseña) return { msg: 'Las contraseñas no conciden' }

    if (typeof datos.usuarios !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Usuarios' }

    if (typeof datos.activos !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Activos' }

    if (typeof datos.solicitudes !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Solicitudes' }

    if (typeof datos.reportes !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Reportes' }

    if (typeof datos.confguraciones !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Configuraciones' }

    if (typeof datos.clasificacion !== "boolean") return { msg: 'Debe Selecioar un estado de la opcion permisos para el menu Cambiar clasificacion activos' }

    if (typeof datos.informes !== "boolean") return { msg: 'Debe Selecioar un estado de la opcion permisos para el menu Informes' }

    if (datos.proveedores.length == 0) return modalMensaje({ titulo: 'ERROR', mensaje: 'El usuario debe estar asociado al menos un porveedor' })

    const validarproveedor = datos.proveedores.map(item => {
        if (validarId(item)) return true
        return false
    })

    if (validarproveedor.some(elemento => elemento === true)) return { msg: 'todos los proveedores deben ser escogidos del listado' }

    const proveedores = await consultarProveedoresUsuarios('SELECT id FROM proveedores')
    if (proveedores.msg) return { msg: 'no se pudieron validar correctamente los datos intentalo más tarde' }

    const validarproveedoresBd = datos.proveedores.map(item => {
        let i = 0
        let encontrado = null
        while (i < proveedores[0].length) {
            const id = parseInt(item.split('-')[1])
            if (id === proveedores[0][i].id) {
                i = proveedores[0].length
                encontrado = true
            } else {
                i++;
            }
        }

        if (encontrado) return true
        return false
    })

    if (validarproveedoresBd.some(elemento => elemento === false)) return { msg: 'todos los proveedores deben ser escogidos del listado' }

    if (!datos.firma) return { msg: 'Debe cargar obligatoriamente una firma' }

    return true

}

const validarDatosUsuariosEditados = async datos => {

    if (!datos.usuario) return { msg: 'Usuario invalido' }

    if (validarId(datos.usuario)) return { msg: 'Usuario invalido' }

    datos.usuario = datos.usuario.split('-')[1]
    const dataUsuario = await consultarProveedoresUsuarios('SELECT us.id, us.numero_id AS numeroDocumento, TRIM(us.tipo_id) AS tipoId, TRIM(us.nombre) AS primerNombre, TRIM(us.nombre_1) AS segundoNombre, TRIM(us.apellido) AS primerApellido,TRIM(us.apellido_1) AS segundoApellido, TRIM(us.email) AS email, us.estado AS estadoId FROM usuarios us WHERE us.id =' + datos.usuario)

    if (dataUsuario.msg) return { msg: 'No fue posible validar los datos del Usuario' }
    const dataUsuarioBd = dataUsuario[0][0]

    // validar email

    const emailLowerCase = datos.email.toLowerCase()

    if (emailLowerCase !== dataUsuarioBd.email.toLowerCase()) {

        if (!regularEmail.test(emailLowerCase)) return { msg: 'El Email es Invalido' }

        if (validarVacios(datos.email)) return { msg: 'El campo Email no puede estar vacio' }

        if (validarCaracteres(datos.email)) return { msg: 'El campo Email no puede contener caracteres como [], {}. <>, (), ect..' }

        if (validarPalabras(datos.email)) return { msg: 'El campo Email no puede contener palabaras como Select, from, Insert, ect..' }

        const regex = /^[^@]+@[^@]+\.[a-zA-Z]+$/;
        if (!regex.test(datos.email)) return { msg: 'El Email es Invalido' }

        const validacion = await validarExisteUsuario("", emailLowerCase.trim())
        if (validacion.msg) return { msg: 'No fue posible validar la existencia del Email' }

        if (validacion[1].length > 0) return { msg: 'El Email esta registrado en otro usuario' }
        datos.email = emailLowerCase
        datos.cambiarEmail = true

    }

    if (datos.tipoId.trim() !== dataUsuarioBd.tipoId) {
        if (validarVacios(datos.tipoId) || validarCaracteres(datos.tipoId) || validarPalabras(datos.tipoId) || datos.tipoId.length > 2) return { msg: 'Debe escoger un tipo de identificacion del listado' }

        datos.tipoId = datos.tipoId.toUpperCase()
    }

    if (datos.primerNombre !== dataUsuarioBd.primerNombre) {

        if (validarVacios(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede estar vacio' }

        if (validarCaracteres(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede contener caracteres como [], {}. <>, (), ect..' }

        if (validarPalabras(datos.primerNombre)) return { msg: 'El campo Primer Nombre no puede contener palabaras como Select, from, Insert, ect..' }

        if (!regularNombre.test(datos.primerNombre.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

        datos.primerNombre = datos.primerNombre.charAt(0).toUpperCase() + datos.primerNombre.toLowerCase().slice(1).trim()
    }

    if (datos.segundoNombre !== dataUsuarioBd.segundoNombre) {
        if (validarCaracteres(datos.segundoNombre)) return { msg: 'El campo segundo Nombre no puede contener caracteres como [], {}. <>, (), ect..' }

        if (validarPalabras(datos.segundoNombre)) return { msg: 'El campo segundo Nombre no puede contener palabaras como Select, from, Insert, ect..' }

        if (datos.segundoNombre.length > 0) {
            if (datos.segundoNombre.trim().length > 0) {
                if (!regularNombre.test(datos.segundoNombre.trim())) return { msg: 'El Campo segundo Nombre solo puede contener letras' }
            }
        }
        datos.segundoNombre = datos.segundoNombre.charAt(0).toUpperCase() + datos.segundoNombre.toLowerCase().slice(1).trim()
    }

    if (datos.primerApellido !== dataUsuarioBd.primerApellido) {
        if (validarVacios(datos.primerApellido)) return { msg: 'El campo Primer Apellido no puede estar vacio' }

        if (validarCaracteres(datos.primerApellido)) return { msg: 'El campo Primer Apellido no puede contener caracteres como [], {}. <>, (), ect..' }

        if (validarPalabras(datos.primerApellido)) return { msg: 'El campo Primer Apellido no puede contener palabaras como Select, from, Insert, ect..' }

        if (!regularNombre.test(datos.primerApellido.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

        datos.primerApellido = datos.primerApellido.charAt(0).toUpperCase() + datos.primerApellido.toLowerCase().slice(1).trim()
    }

    if (datos.segundoApellido !== dataUsuarioBd.segundoApellido) {

        if (validarVacios(datos.segundoApellido)) return { msg: 'El campo Segundo Apellido no puede estar vacio' }

        if (validarCaracteres(datos.segundoApellido)) return { msg: 'El campo Segundo Apellido no puede contener caracteres como [], {}. <>, (), ect..' }

        if (validarPalabras(datos.segundoApellido)) return { msg: 'El campo Segundo Apellido no puede contener palabaras como Select, from, Insert, ect..' }

        if (!regularNombre.test(datos.segundoApellido.trim())) return { msg: 'El Campo Primer Nombre solo puede contener letras' }

        datos.segundoApellido = datos.segundoApellido.charAt(0).toUpperCase() + datos.segundoApellido.toLowerCase().slice(1).trim()
    }


    if (datos.datosExtendidos) {

        if (datos.numeroDocumento !== dataUsuarioBd.numeroDocumento) {
            if (!regularNumber.test(datos.numeroDocumento)) return { msg: 'Numero de documento invalido' }
            if (validarVacios(datos.numeroDocumento)) return { msg: 'El campo numero de documento no puede estar vacio' }

            if (parseInt(datos.numeroDocumento) == NaN) return { msg: 'El campo numero de documento solo puede contener letras' }

            const validacion = await validarExisteUsuario(datos.numeroDocumento, '')
            if (validacion.msg) return { msg: 'No fue posible validar la existencia del Numero de documento' }

            if (validacion[0].length > 0) return { msg: 'El Numero de documento esta registrado en otro usuario' }
            datos.cambiarDocumento = true
        }

        if (datos.contraseña.length > 0) {

            if (!datos.confirmarContraseña) return { msg: 'El campo confirmar Comtraseña es obligatorio' }

            if (validarVacios(datos.contraseña)) return { msg: 'El campo Contraseña no puede estar vacio' }

            if (datos.contraseña.includes(' ')) return { msg: 'El campo Contraseña no puede contener espacios' }

            if (datos.contraseña.length < 6) return { msg: 'La contraseña debe tener almenos 5 caracteres' }

            if (datos.contraseña !== datos.confirmarContraseña) return { msg: 'Las contraseñas no conciden' }
            
            if (datos.contraseña.length < 6 || datos.contraseña.length > 16) return { msg:'La contraseña debe estar entre 6 y 16 caracteres'}
            
            datos.password = await encryptPassword(datos.contraseña)
            delete datos.contraseña
            delete datos.confirmarContraseña
            datos.cambiarContraseña = true
        }

        if (typeof datos.usuarios !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Usuarios' }

        if (typeof datos.activos !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Activos' }

        if (typeof datos.solicitudes !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Solicitudes' }

        if (typeof datos.reportes !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Reportes' }

        if (typeof datos.confguraciones !== "boolean") return { msg: 'Debe Selecionar un estado de la opcion permisos para el menu Configuraciones' }

        if (typeof datos.clasificacion !== "boolean") return { msg: 'Debe Selecioar un estado de la opcion permisos para el menu Cambiar clasificacion activos' }

        if (typeof datos.informes !== "boolean") return { msg: 'Debe Selecioar un estado de la opcion permisos para el menu Informes' }

        if (validarId(datos.estado)) return { msg: 'Debe escoger un estado para el Usuario' }

        if (datos.estado !== 'Es-1') if (datos.estado !== 'Es-2') return { msg: 'Debe escoger un estado para el Usuario' }

        datos.permisos = []

        if (datos.usuarios) datos.permisos.push(1)
        delete datos.usuarios
        if (datos.informes) datos.permisos.push(2)
        delete datos.informes
        if (datos.activos) datos.permisos.push(3)
        delete datos.activos
        if (datos.clasificacion) datos.permisos.push(4)
        delete datos.clasificacion
        if (datos.solicitudes) datos.permisos.push(5)
        delete datos.solicitudes
        if (datos.reportes) datos.permisos.push(6)
        delete datos.reportes
    
        if (datos.confguraciones) datos.permisos.push(8)
        delete datos.confguraciones
        
        datos.estado = datos.estado.split('-')[1]

    }

    return datos
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

        if(validacion[1].length == 0) return { msg: 'El usuario Invalido ó inexistente' }

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
        if(validacion[0].length == 0) return { msg: 'El usuario Invalido ó inexistente' }
        
        if (validacion[0][0].estado != 1) {
            return { msg: 'El usuario esta inactivo' }
        }
        return validacion[0][0]
    }

    return { msg: 'debe ingresar un email o un numero de id para poder iniciar sesion' }
}

export {
    validarDatosUsuarios,
    validarUsuarioCreado,
    validarDatosUsuariosEditados
}