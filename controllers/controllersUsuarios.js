import fs from 'fs'
import path from 'path'
import { validarDatosUsuarios, validarUsuarioCreado } from "../helpers/validarDatosUsuario.js"
import { encryptPassword, validarPassword } from "../helpers/hashpasswords.js"
import { encriptarJson } from "../helpers/encriptarData.js"
import { consultarDataUsuario,
    guardarUsuario,
    actualizarUsuario,
    guardarToken,
    buscarUsuario,
    consultarProveedoresUsuarios} from "../db/sqlUsuarios.js"
import { validarImagenes } from '../helpers/validarFiles.js'
import { guardarImagenesBase64, bufferimagen } from '../helpers/copiarCarpetasArchivos.js'
const __dirname = new URL('.', import.meta.url).pathname.substring(1)

// iniciar sesion 

const iniciaSesion = async (req, res) => {

    const { usuario, password } = req.body

    //validar usuario  existe
    const idUsuario = await validarUsuarioCreado(usuario)
    if (idUsuario.msg) {
        res.json(idUsuario)
        return
    }

    //check password
    const validacionPassword = await validarPassword(password, idUsuario.id)

    if (validacionPassword.msg) {
        res.json(validacionPassword)
        return
    }

    if (!validacionPassword) {
        res.json({ msg: 'Password incorrecto' })
        return
    }

    // consultar datos del usuario
    const hoy = new Date(Date.now())
    const fecha = hoy.toLocaleDateString
    const dataToken = {
        id: idUsuario.id,
        fechaexpiracion: fecha,
    }


    // devolver datos de inicio de sesion
    const token = encriptarJson(dataToken)
    const tokenGuardado = await guardarToken(token, idUsuario.id)
    if (tokenGuardado.msg) {
        res.json(tokenGuardado)
        return
    }

    const rutaArchivo = path.join(__dirname, '..', 'quotes.json');
    const contenidoArchivo = fs.readFileSync(rutaArchivo, 'utf-8');
    const contenidoSinBOM = contenidoArchivo.toString().replace(/^\uFEFF/, '');
    const frases = JSON.parse(contenidoSinBOM)
    const index = Math.floor(Math.random() * frases.length)

    const permisosbd = tokenGuardado.permisos.split(',')
    const permisos = permisosbd.map(elemento => parseInt(elemento.trim(), 10))

    const proveedoresbd = tokenGuardado.proveedores.split(',')
    const proveedores = proveedoresbd.map(elemento => parseInt(elemento.trim(), 10))


    res.json({
        token,
        frase: {
            nombre: tokenGuardado.nombreUsuario.split(' ')[0],
            frase: frases[index].text,
            author: frases[index].author
        },
        data: {
            nombre: tokenGuardado.nombreUsuario,
            permisos,
            proveedores,
            estado: tokenGuardado.estado,
            id: tokenGuardado.id
        }
    })
}

// create new user
const crearUsuario = async (req, res) => {

    // validar si tiene o no permisos para crear usuario
    const { sessionid, permisos } = req
    // 1 permiso para crear usuario
    if (permisos.indexOf(1) === -1) {
        res.json({ msg: 'Usted no tiene permisos para crear usuarios' })
        return
    }

    const datos = req.body

    const validacion = await validarDatosUsuarios(datos)

    if (validacion.msg) {
        res.json(validacion)
        return
    }

    const validacionImagen = validarImagenes(datos.firma)
    if (validacionImagen.msg) return res.json(validacionImagen)

    datos.Id_proveedores = datos.proveedores.map(item => { return parseInt(item.split('-')[1]) })
    datos.date_create = new Date(Date.now()).toISOString().substring(0, 19).replace('T', ' ')
    datos.createby = sessionid
    delete datos.proveedores
    datos.permisos = []

    if (datos.usuarios) datos.permisos.push(1)
    delete datos.usuarios
    if (datos.activos) datos.permisos.push(3)
    delete datos.activos
    if (datos.solicitudes) datos.permisos.push(5)
    delete datos.solicitudes
    if (datos.reportes) datos.permisos.push(6)
    delete datos.reportes
    if (datos.confguraciones) datos.permisos.push(8)
    delete datos.confguraciones
    if (datos.clasificacion) datos.permisos.push(4)
    delete datos.clasificacion

    //encriptar password
    datos.password = await encryptPassword(datos.contraseña)
    delete datos.contraseña
    delete datos.confirmarContraseña

    const firma = await guardarImagenesBase64(datos.firma, 'no', 3)
    datos.pathFirma = firma
    delete datos.firma

    datos.email = datos.email.toLowerCase()
    datos.tipoId = datos.tipoId.toUpperCase()
    datos.primerNombre = datos.primerNombre.charAt(0).toUpperCase() + datos.primerNombre.toLowerCase().slice(1)
    if (datos.segundoNombre != '') {
        datos.segundoNombre = datos.segundoNombre.toLowerCase().charAt(0).toUpperCase() + datos.segundoNombre.toLowerCase().slice(1)
    }
    datos.primerApellido = datos.primerApellido.toLowerCase().charAt(0).toUpperCase() + datos.primerApellido.toLowerCase().slice(1)
    datos.segundoApellido = datos.segundoApellido.toLowerCase().charAt(0).toUpperCase() + datos.segundoApellido.toLowerCase().slice(1)

    /// agregar crear usuario con req. body para enviar los datos del usuario a la base de datos
    const usuarioCreado = await guardarUsuario(datos)
    if (usuarioCreado.msg) {
        res.json(usuarioCreado)
    }
    res.json(usuarioCreado)
}

const consultarUsuario = async (req, res) => {

    // validar si tiene o no permisos para crear usuario
    const { sessionid, permisos } = req
    const { id } = req.body
    const nid= parseInt(id)
    if(nid == NaN) return {msg: 'El ID del usuario es invalido'}

    if(nid != sessionid) if (permisos.indexOf(1) === -1) return  res.json({ msg: 'Usted no tiene permisos para editar usuarios' })
    
    const usuario = await buscarUsuario(nid)
    if(usuario.msg) return res.json(usuario)

    const permisosUsuario =  usuario.permisos.split(',').map(item => {return parseInt(item)})
    if(permisosUsuario.indexOf(1) !== -1) usuario.usuario = true
    if(permisosUsuario.indexOf(3) !== -1) usuario.activo = true
    if(permisosUsuario.indexOf(5) !== -1) usuario.solicitudes = true
    if(permisosUsuario.indexOf(6) !== -1) usuario.reporte = true
    if(permisosUsuario.indexOf(8) !== -1) usuario.confguraciones = true
    if(permisosUsuario.indexOf(4) !== -1) usuario.clasificacion = true
    delete usuario.permisos
    if(usuario.firma !== null && usuario.firma.trim() !== ''){
        usuario.firmaUrl = await bufferimagen(usuario.firma, '', 3)
    }else{
        usuario.firmaUrl = await bufferimagen('NO FIRMA.png', '', 3)
    }

    const proveedores =  usuario.IdPporveedores.split(',').map(item => {return parseInt(item)})
    let consulta = null
    proveedores.forEach(element => {
        if(consulta === null){
           consulta = "SELECT CONCAT('Pro-', id) AS id, CONCAT(TRIM(razon_social),'--', TRIM(nombre_comercial),'--', TRIM(nit)) AS nombre  FROM proveedores WHERE id =" + element + "\n"
        }else{
            consulta = consulta + "SELECT CONCAT('Pro-', id) AS id, CONCAT(TRIM(razon_social),'--', TRIM(nombre_comercial),'--', TRIM(nit)) AS nombre  FROM proveedores WHERE id =" + element + "\n"
        }
        
    });
    usuario.proveedores = await consultarProveedoresUsuarios(consulta)
    if (usuario.proveedores.msg) return res.json( usuario.proveedores);
    if (permisos.indexOf(1) !== -1) usuario.listaUsuarios = await consultarProveedoresUsuarios("SELECT CONCAT( 'Us-', id) AS id, CONCAT( numero_id, '--', TRIM(nombre), SPACE(1), TRIM(nombre_1), SPACE(1), TRIM(apellido), SPACE(1), TRIM(apellido_1), '--', TRIM(email)) AS nombre FROM usuarios")
    if(usuario.id == sessionid  && usuario.id != 1) return res.json(usuario)

    usuario.listaproveedores = await consultarProveedoresUsuarios("SELECT CONCAT('Pro-', id) AS id, CONCAT(TRIM(razon_social),'--', TRIM(nombre_comercial),'--', TRIM(nit)) AS nombre  FROM proveedores")

    usuario.listadoEstados = await consultarProveedoresUsuarios("SELECT id, TRIM(estado) AS estados FROM estados WHERE id <> 3")
    
    res.json(usuario)

}


// actualiza datos de usuario.
const actualizaUsuario = async (req, res) => {
    const { sessionid, permisos } = req
    const dataUsuarioActualizar = req.body
    const arrPermisos = JSON.parse(permisos)

    if (sessionid !== dataUsuarioActualizar.id) {
        if (arrPermisos.indexOf(2) === -1) {
            return res.json({ msg: 'Usted no tiene permisos para Actualizar usuarios' })
        }
    } else {
        // verificar que no se este modificando el documento o el correo
        const dataUsuarioDb = await consultarDataUsuario(dataUsuarioActualizar.id)
        if (dataUsuarioDb.numero_id !== dataUsuarioActualizar.numero_id || dataUsuarioDb.email !== dataUsuarioActualizar.email.toLowerCase()) {

            if (arrPermisos.indexOf(2) === -1) {
                return res.json({ msg: 'Usted no tiene permisos para el numero de documento y correo de usuarios' })
            }
        }
    }

    // comporar por medio de contaseña que es en realidad el usuario quien desea actualizar los datos 
    const validacionPassword = await validarPassword(dataUsuarioActualizar.passWordUsuarioSesion, sessionid)

    if (validacionPassword.msg) {
        res.json(validacionPassword)
        return
    }

    if (!validacionPassword) {
        res.json({ msg: 'Password incorrecto' })
        return
    }

    delete dataUsuarioActualizar.passWordUsuarioSesion
    // validar si se va  actulizar la contraseña.
    let validarNuevopassword = true
    if (!dataUsuarioActualizar.password) {
        validarNuevopassword = false
    }

    // validar que los datos esten correctos
    const validacionDatosActualizar = await validarDatosUsuarios(dataUsuarioActualizar, validarNuevopassword)

    if (validacionDatosActualizar.msg !== 'validado') {
        res.json(validacionDatosActualizar)
        return
    }

    //hahsear la nueva contraseña
    if (validarNuevopassword) {
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

    dataUsuarioActualizar.apellido_1 = dataUsuarioActualizar.apellido_1.toLowerCase().charAt(0).toUpperCase() + dataUsuarioActualizar.apellido_1.toLowerCase().slice(1)


    const usuarioActualizado = await actualizarUsuario(dataUsuarioActualizar)
    if (usuarioActualizado.msg) {
        res.json(usuarioActualizado)
    }

    res.json(dataUsuarioActualizar)
}

export {
    iniciaSesion,
    crearUsuario,
    actualizaUsuario,
    consultarUsuario
} 