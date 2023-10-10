import fs, { realpathSync } from 'fs'
import path from 'path'
import { validarDatosUsuarios, validarUsuarioCreado, validarDatosUsuariosEditados } from "../helpers/validarDatosUsuario.js"
import { encryptPassword, validarPassword } from "../helpers/hashpasswords.js"
import { encriptarJson } from "../helpers/encriptarData.js"
import {
    consultarDataUsuario,
    guardarUsuario,
    actualizarUsuario,
    guardarToken,
    buscarUsuario,
    consultarProveedoresUsuarios
} from "../db/sqlUsuarios.js"
import { validarImagenes } from '../helpers/validarFiles.js'
import { guardarImagenesBase64, bufferimagen } from '../helpers/copiarCarpetasArchivos.js'
import { constants } from 'buffer'
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
    if (datos.informes) datos.permisos.push(2)
    delete datos.informes
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
    const nid = parseInt(id)
    if (nid == NaN) return { msg: 'El ID del usuario es invalido' }

    if (nid != sessionid) if (permisos.indexOf(1) === -1) return res.json({ msg: 'Usted no tiene permisos para editar usuarios' })

    const usuario = await buscarUsuario(nid)
    if (usuario.msg) return res.json(usuario)

    const permisosUsuario = usuario.permisos.split(',').map(item => { return parseInt(item) })
    if (permisosUsuario.indexOf(1) !== -1) usuario.usuario = true
    if (permisosUsuario.indexOf(3) !== -1) usuario.activo = true
    if (permisosUsuario.indexOf(5) !== -1) usuario.solicitudes = true
    if (permisosUsuario.indexOf(6) !== -1) usuario.reporte = true
    if (permisosUsuario.indexOf(8) !== -1) usuario.confguraciones = true
    if (permisosUsuario.indexOf(4) !== -1) usuario.clasificacion = true
    delete usuario.permisos
    if (usuario.firma !== null && usuario.firma.trim() !== '') {
        usuario.firmaUrl = await bufferimagen(usuario.firma, '', 3)
    } else {
        usuario.firmaUrl = await bufferimagen('NO FIRMA.png', '', 3)
    }

    const proveedores = usuario.IdPporveedores.split(',').map(item => { return parseInt(item) })
    let consulta = null
    proveedores.forEach(element => {
        if (consulta === null) {
            consulta = "SELECT CONCAT('Pro-', id) AS id, CONCAT(TRIM(razon_social),'--', TRIM(nombre_comercial),'--', TRIM(nit)) AS nombre  FROM proveedores WHERE id =" + element + "\n"
        } else {
            consulta = consulta + "SELECT CONCAT('Pro-', id) AS id, CONCAT(TRIM(razon_social),'--', TRIM(nombre_comercial),'--', TRIM(nit)) AS nombre  FROM proveedores WHERE id =" + element + "\n"
        }

    });
    usuario.proveedores = await consultarProveedoresUsuarios(consulta)
    if (usuario.proveedores.msg) return res.json(usuario.proveedores);
    if (permisos.indexOf(1) !== -1) usuario.listaUsuarios = await consultarProveedoresUsuarios("SELECT CONCAT( 'Us-', id) AS id, CONCAT( numero_id, '--', TRIM(nombre), SPACE(1), TRIM(nombre_1), SPACE(1), TRIM(apellido), SPACE(1), TRIM(apellido_1), '--', TRIM(email)) AS nombre FROM usuarios")

    if (usuario.id == sessionid && usuario.id != 1) return res.json(usuario)

    usuario.listaproveedores = await consultarProveedoresUsuarios("SELECT CONCAT('Pro-', id) AS id, CONCAT(TRIM(razon_social),'--', TRIM(nombre_comercial),'--', TRIM(nit)) AS nombre  FROM proveedores")

    usuario.listadoEstados = await consultarProveedoresUsuarios("SELECT id, TRIM(estado) AS estados FROM estados WHERE id <> 3")

    res.json(usuario)

}
// actualiza datos de usuario.
const actualizaUsuario = async (req, res) => {

    const { sessionid, permisos } = req

    const datos = req.body.data
    if (datos.usuario == undefined) return res.json({ msg: 'Usuario invalido' })

    const id = parseInt(datos.usuario.split('-')[1])
    if (id == NaN) return res.json({ msg: 'Usuario invalido' })

    if (id !== sessionid) if (permisos.indexOf(1) === -1) return res.json({ msg: 'Usted no tiene permisos para editar usuarios' })


    const validacion = await validarDatosUsuariosEditados(datos)

    if (validacion.msg) return res.json(validacion)

    let datoVariables = "nombre = '" + validacion.primerNombre + "', nombre_1 = '" + validacion.segundoNombre + "', apellido = '" + validacion.primerApellido + "', apellido_1 = '" + validacion.segundoApellido + "', tipo_id = '" + validacion.tipoId + "'"

    if (validacion.cambiarEmail) datoVariables = datoVariables + ", email = '" + validacion.email + "'"

    if (id === sessionid && id !== 1) {

        datoVariables = "UPDATE usuarios \n SET " + datoVariables + " \n WHERE id = " + validacion.usuario
        const actualizar = await actualizarUsuario(datoVariables)
        if (actualizar.msg) return actualizar

        return res.json({ id: validacion.usuario })
    }

    datoVariables = datoVariables + ", permisos = '" + validacion.permisos + "', estado = '" + validacion.estado + "'"

    if (validacion.cambiarDocumento) datoVariables = datoVariables + ", numero_id = '" + validacion.numeroDocumento + "'"

    if (validacion.cambiarContraseña) datoVariables = datoVariables + ", password = '" + validacion.password + "'"

    datoVariables = "UPDATE usuarios \n SET " + datoVariables + " \n WHERE id = " + validacion.usuario

    const actualizar = await actualizarUsuario(datoVariables)
    if (actualizar.msg) return actualizar

    return res.json({ id: validacion.usuario })

}
const cambiarFirma = async (req, res) => {

    const { sessionid, permisos } = req

    const datos = req.body.data
    if (datos.usuario == undefined) return res.json({ msg: 'Usuario invalido' })

    const id = parseInt(datos.usuario.split('-')[1])
    if (id == NaN) return res.json({ msg: 'Usuario invalido' })

    if (id == sessionid && id !== 1) return res.json({ msg: 'Debe solicitarle a un usuario con permisos que le cambie su firma' })

    if (permisos.indexOf(1) === -1 && id !== 1) return res.json({ msg: 'Usted no tiene permisos para cambiar la firma de otros usuarios' })

    const documento = await consultarProveedoresUsuarios('SELECT numero_id FROM usuarios WHERE id =' + id)
    if (documento.msg) return res.json({ msg: 'No fue posible validar los datos del usuario a actualizar' })

    if (documento[0][0].numero_id !== datos.id) return res.json({ msg: 'el Id del usuario no corresponde al documento' })
    const validarfirma = validarImagenes(datos.firma)
    if (validarfirma.msg) return res.json(validarfirma)

    const firma = await guardarImagenesBase64(datos.firma, 'no', 3)
    if (firma.msg) return res.json({ msg: 'No fue posible guardar la nueva firma, Intentelo mas tardes' })

    const actualizar = await actualizarUsuario("UPDATE usuarios SET firma = '" + firma + "' WHERE id =" + id)
    if (actualizar.msg) return res.json({ msg: 'No fue posible guardar la nueva firma en la base de datos, Intentelo mas tardes' })

    res.json({ exito: 'Firma Actualziada correctamente' })
}
const guardarProveedorUsuario = async (req, res) => {
    const { sessionid, permisos } = req

    const datos = req.body.data
    if (datos.usuario == undefined) return res.json({ msg: 'Usuario invalido' })

    const id = parseInt(datos.usuario.split('-')[1])
    if (id == NaN) return res.json({ msg: 'Usuario invalido' })

    if (id == sessionid && id !== 1) return res.json({ msg: 'Debe solicitarle a un usuario con permisos que le asocie el nuevo proveedor' })

    if (permisos.indexOf(1) === -1 && id !== 1) return res.json({ msg: 'Usted no tiene permisos para cambiar asociar proveedores' })

    const proveedor = parseInt(datos.proveedor.split('-')[1])
    if (proveedor == NaN) return res.json({ msg: 'Proveedor Invalido' })

    const datosUsuario = await consultarProveedoresUsuarios('SELECT numero_id, TRIM(Id_proveedores) AS proveedores FROM  usuarios WHERE id =' + id + '\n SELECT id FROM proveedores WHERE id =' + proveedor)

    if (datosUsuario.msg) return res.json({ msg: 'No fue posible validar los datos del usuario y proveedor a actualizar' })

    if (datosUsuario[1][0].length < 1) return res.json({ msg: 'El proveedor no existe' })

    if (datosUsuario[0][0].numero_id !== datos.id) return res.json({ msg: 'el Id del usuario no corresponde al documento' })

    const proveedores = datosUsuario[0][0].proveedores + ',' + proveedor

    const actualizar = await actualizarUsuario("UPDATE usuarios SET Id_proveedores = '" + proveedores + "' WHERE id =" + id)

    if (actualizar.msg) return res.json({ msg: 'No fue posible asociar el nuevo proveedor al usuario, intentelo mas tarde' })

    res.json({ exito: 'Proveedor agregado correctamente' })
}

const eliminarProveedorUsuario = async (req, res) => {
    const { sessionid, permisos } = req

    const datos = req.body.data
    if (datos.usuario == undefined) return res.json({ msg: 'Usuario invalido' })

    const id = parseInt(datos.usuario.split('-')[1])
    if (id == NaN) return res.json({ msg: 'Usuario invalido' })

    if (id == sessionid && id !== 1) return res.json({ msg: 'Debe solicitarle a un usuario con permisos que le asocie el nuevo proveedor' })

    if (permisos.indexOf(1) === -1 && id !== 1) return res.json({ msg: 'Usted no tiene permisos para cambiar asociar proveedores' })

    const proveedor = parseInt(datos.proveedor.split('-')[1])
    if (proveedor == NaN) return res.json({ msg: 'Proveedor Invalido' })

    const datosUsuario = await consultarProveedoresUsuarios('SELECT numero_id, TRIM(Id_proveedores) AS proveedores FROM  usuarios WHERE id =' + id)

    if (datosUsuario.msg) return res.json({ msg: 'No fue posible validar los datos del usuario a actualizar' })

    if (datosUsuario[0][0].numero_id !== datos.id) return res.json({ msg: 'el Id del usuario no corresponde al documento' })

    const proveedores = datosUsuario[0][0].proveedores.split(',').map(element => { return parseInt(element) })

    const nuevosProveedores = proveedores.filter(element => element !== proveedor)

    const actualizar = await actualizarUsuario("UPDATE usuarios SET Id_proveedores = '" + nuevosProveedores + "' WHERE id = " + id)

    if (actualizar.msg) return res.json({ msg: 'No fue posible eliminar el proveedor del usuario, intentelo mas tarde' })

    res.json({ exito: 'Proveedor eliminado  correctamente del usuario' })
}

const cambiarContraseña = async (req, res) => {
    const { sessionid } = req

    const datos = req.body.data
    if (datos.usuario == undefined) return res.json({ msg: 'Usuario invalido' })

    if (parseInt(datos.usuario) === NaN) return res.json({ msg: 'El Usuario es Invalido' })

    if (datos.usuario !== sessionid) return res.json({ msg: 'El Usuario no corresponde al usuario de inicio de sesion ' })

    if (!datos.claveActual) return { msg: 'El campo clave actual es obligatorio'}

    if (!datos.nuevaclave) return { msg: 'El campo clave actual es obligatorio'}

    if (!datos.confirmarclave) return { msg: 'El campo clave actual es obligatorio'}

    if (datos.claveActual.length === 0) return { msg: 'El campo Contraseña Actual no puede estar vacio' }

    if (datos.claveActual.includes(' ')) if (datos.claveActual.trim() == '') return { msg: 'El campo Contraseña Actual no puede estar vacio' }
    
    if (datos.nuevaclave.length === 0) return { msg: 'El campo Nuevacampo Nueva Contraseña no puede estar vacio' }

    if (datos.nuevaclave.includes(' ')) if (datos.nuevaclave.trim() == '') return { msg: 'El campo Nueva Contraseña no puede estar vacio' }

    if (datos.nuevaclave.includes(' ')) return { msg: 'El campo Nueva Contraseña no puede contener espacios' }

    if (datos.nuevaclave.length < 6 || datos.nuevaclave.length > 16) return { msg:'La contraseña debe estar entre 6 y 16 caracteres'}
    
    if (datos.nuevaclave === datos.claveActual) return { msg: 'La nueva contraseña debe ser diferente a las utimas 3 contraseñas'}

    if (datos.nuevaclave !== datos.confirmarclave) return { msg: 'Las contraseñas no conciden' }

    // comporar por medio de contaseña que es en realidad el usuario quien desea actualizar los datos 
    const validacionPassword = await validarPassword(datos.claveActual, sessionid)

    if (validacionPassword.msg) return res.json(validacionPassword)
        
    if (!validacionPassword) return res.json({ msg: 'La contraseña Actual es incorrecta'})
           

    const contraseña = await encryptPassword(datos.nuevaclave)
   
    const actualizar = await actualizarUsuario("UPDATE usuarios \n SET password = '" + contraseña + "' \n WHERE id = " + sessionid)
    if(actualizar.msg) return res.json({ msg: 'No fuen posible actualizar la contraseña'})

    res.json({ exito: 'Contraseña Actualizada Correctamente' })
}

export {
    iniciaSesion,
    crearUsuario,
    actualizaUsuario,
    consultarUsuario,
    cambiarFirma,
    guardarProveedorUsuario,
    eliminarProveedorUsuario,
    cambiarContraseña
}