import { config } from "dotenv"
import { consultaconfi, actualizarConfig } from "../db/sqlConfig.js"
import { validarDatosConfigGeneral } from "../helpers/validarDatosConfig.js"
actualizarConfig

const consultarconfig = async (req, res) => {
    const { permisos } = req
    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(7) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para consultar esta información' })
    }

    const tablasConfig = {
        '1': 'areas',
        '2': 'marca_activos',
        '3': 'tipo_activo',
        '4': 'frecuencia_Mtto',
        '5': 'procesos',
        '6': 'clasificacion_activos',
        '7': 'proveedores'
    }
    const { config } = req.body

    if (!tablasConfig[config]) {
        return res.json({ msg: 'solicitud ivalida' })
    }
    const tabla = await consultaconfi(tablasConfig[config])
    res.json(tabla)
}

const crearConfig =async (req, res) => {
    const { permisos } = req

    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(7) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para crear configuraciones' })
    }

    const { config, data } = req.body

    // validar datos.
    let query

    const validar = validarDatosConfigGeneral(data)
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
            query = `UPDATE frecuencia_Mtto SET frecuencia = '${data.nombre}', dias = '${data.dias}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 5:
            data.sigla= data.sigla.toUpperCase()
            query = `UPDATE procesos SET proceso = '${data.nombre}', sigla = '${data.sigla}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 6:
            data.siglas= data.siglas.toUpperCase()
            query = `UPDATE clasificacion_activos SET nombre = '${data.nombre}', siglas = '${data.siglas}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 7:
            query = `UPDATE proveedores SET nombre_comercial = '${data.nombre}', razon_social = '${data.razon_social}', nit = '${data.nit}', dv = '${data.dv}', telefonos = '${data.telefonos}', contacto = '${data.contacto}', direccion = '${data.direccion}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break
            
        default:
            return res.json({ msg: 'Solicitud invalida' })

            break
    }

    const actualizar = await actualizarConfig(query)

    if(actualizar.msg){
        return res.json(actualizar)
    }

    return res.json({
        msg:'la actualizacion ha sido exitosa',
        data
    })

}

const actualizarConfig = async (req, res) => {
    const { permisos } = req

    const arrPermisos = JSON.parse(permisos)
    if (arrPermisos.indexOf(7) === -1) {
        return res.json({ msg: 'Usted no tiene permisos para consultar esta información' })
    }

    const { config, data } = req.body

    // validar datos.
    let query

    const validar = validarDatosConfigGeneral(data)
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
            query = `UPDATE frecuencia_Mtto SET frecuencia = '${data.nombre}', dias = '${data.dias}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 5:
            data.sigla= data.sigla.toUpperCase()
            query = `UPDATE procesos SET proceso = '${data.nombre}', sigla = '${data.sigla}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 6:
            data.siglas= data.siglas.toUpperCase()
            query = `UPDATE clasificacion_activos SET nombre = '${data.nombre}', siglas = '${data.siglas}',  estado = '${data.estado}' WHERE id = '${data.id}'`
            break
        case 7:
            query = `UPDATE proveedores SET nombre_comercial = '${data.nombre}', razon_social = '${data.razon_social}', nit = '${data.nit}', dv = '${data.dv}', telefonos = '${data.telefonos}', contacto = '${data.contacto}', direccion = '${data.direccion}', estado = '${data.estado}' WHERE id = '${data.id}'`
            break
            
        default:
            return res.json({ msg: 'Solicitud invalida' })

            break
    }

    const actualizar = await actualizarConfig(query)

    if(actualizar.msg){
        return res.json(actualizar)
    }

    return res.json({
        msg:'la actualizacion ha sido exitosa',
        data
    })

}

export {
    consultarconfig,
    actualizarConfig,
    crearConfig
}