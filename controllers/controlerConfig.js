import { config } from "dotenv"
import { consultaconfi, actualizarConfigDb, guardarConfig } from "../db/sqlConfig.js"
import { validarDatosConfigActualizar, validarDatosConfigNuevo } from "../helpers/validarDatosConfig.js"


const consultarconfig = async (req, res) => {
    const tablasConfig = {
        '1': 'areas',
        '2': 'marca_activos',
        '3': 'tipo_activo',
        '4': 'lista_componentes',
        '5': 'frecuencia_Mtto',
        '6': 'procesos',
        '7': 'clasificacion_activos',
        '8': 'proveedores'
    }
    const { config } = req.body

    if (!tablasConfig[config]) {
        return res.json({ msg: 'solicitud ivalida' })
    }
    const tabla = await consultaconfi(tablasConfig[config])
    res.json(tabla)
}

const crearConfig = async (req, res) => {
    const { permisos } = req

    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(8) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para crear configuraciones' })
    }

    const { config, data } = req.body

    // validar datos.
    let query

    const validar = validarDatosConfigNuevo(data)
    if (validar.msg) {
        return res.json(validar)
    }


    switch (config) {
        case 1:
            query = `INSERT INTO areas (area, estado) VALUES('${data.nombre}', '1') 
                    SELECT IDENT_CURRENT('areas') AS id`
            break
        case 2:
            query = `INSERT INTO marca_activos (marca, estado) VALUES('${data.nombre}', '1') 
                    SELECT IDENT_CURRENT('marca_activos') AS id`
            break
        case 3:
            query = `INSERT INTO tipo_activo (tipo_activo, estado) VALUES('${data.nombre}', '1') 
                    SELECT IDENT_CURRENT('tipo_activo') AS id`
            break
        case 4:
            query = `INSERT INTO lista_componentes (componente, estado) VALUES('${data.nombre}', '1') 
                        SELECT IDENT_CURRENT('lista_componentes') AS id`
            break
        case 5:
            query = `INSERT INTO frecuencia_Mtto (frecuencia, dias, estado) VALUES('${data.nombre}', '${data.dias}', '1') 
                    SELECT IDENT_CURRENT('frecuencia_Mtto') AS id`
            break
        case 6:
            data.sigla = data.sigla.toUpperCase()

            query = `INSERT INTO procesos (proceso, sigla, estado) VALUES('${data.nombre}', '${data.sigla}', '1') 
                    SELECT IDENT_CURRENT('procesos') AS id`
            break
        case 7:
            data.siglas = data.siglas.toUpperCase()

            query = `INSERT INTO clasificacion_activos (nombre, siglas, estado) VALUES('${data.nombre}', '${data.siglas}', '1') 
                    SELECT IDENT_CURRENT('clasificacion_activos') AS id`
            break
        case 8:
            query = `INSERT INTO proveedores (nombre_comercial, razon_social, nit, dv, telefonos, contacto, direccion, estado) VALUES('${data.nombre}', '${data.razon_social}', '${data.nit}', '${data.dv}', '${data.telefonos}', '${data.contacto}', '${data.direccion}', '1') 
                    SELECT IDENT_CURRENT('proveedores') AS id`
            break
        default:
            return res.json({ msg: 'Solicitud invalida' })

    }

    const actualizar = await guardarConfig(query)

    if (actualizar.msg) {
        return res.json(actualizar)
    }
    data.id = actualizar

    return res.json({
        msg: 'creado exitosamente',
        data
    })
}

const actualizarConfig = async (req, res) => {
    const { permisos } = req

    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(9) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para consultar esta información' })
    }

    const { config, data } = req.body

    // validar datos.
    let query

    const validar = validarDatosConfigActualizar(data)
    if (validar.msg) {
        return res.json(validar)
    }
    switch (config) {
        case 1:
            query = `UPDATE areas SET area = '${data.nombre}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 2:
            query = `UPDATE marca_activos SET marca = '${data.nombre}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 3:
            query = `UPDATE tipo_activo SET tipo_activo = '${data.nombre}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 4:
            query = `UPDATE lista_componentes SET componente = '${data.nombre}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 5:
            query = `UPDATE frecuencia_Mtto SET frecuencia = '${data.nombre}', dias = '${data.dias}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 6:
            data.sigla = data.sigla.toUpperCase()
            query = `UPDATE procesos SET proceso = '${data.nombre}', sigla = '${data.sigla}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 7:
            data.siglas = data.siglas.toUpperCase()
            query = `UPDATE clasificacion_activos SET nombre = '${data.nombre}', siglas = '${data.siglas}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 8:
            query = `UPDATE proveedores SET nombre_comercial = '${data.nombre}', razon_social = '${data.razon_social}', nit = '${data.nit}', dv = '${data.dv}', telefonos = '${data.telefonos}', contacto = '${data.contacto}', direccion = '${data.direccion}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break

        default:
            return res.json({ msg: 'Solicitud invalida' })
    }

    const actualizar = await actualizarConfigDb(query)

    if (actualizar.msg) {
        return res.json(actualizar)
    }

    return res.json({
        msg: 'la actualizacion ha sido exitosa',
        data
    })

}

export {
    consultarconfig,
    actualizarConfig,
    crearConfig
}