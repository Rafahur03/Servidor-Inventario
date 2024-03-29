﻿import {
    eliminarComponenteDb,
    consultarComponentes,
    crearComponente
} from "../db/sqlComponentes.js"

import { validarDatosComponente } from "../helpers/validarComponentes.js"
import { actividadUsuario } from "../db/sqlUsuarios.js"

const eliminarComponente = async (req, res) => {
    try {

        const {sessionid, permisos } = req

        if (permisos.indexOf(3) === -1) return res.json({ msg: 'Usted no tiene permisos para Actualizar Componente' })
        
        const data = req.body.data

        if (data == '' || data == null || data == undefined) return res.json({ msg: 'Debe seleccionar un componente valido para eliminar' })
        
        if (data.idActivo == '' || data.idActivo == null || data.idActivo == undefined) return res.json({ msg: 'No se reconoce el ID del activo' })
        
        if (data.idComponente == '' || data.idComponente == null || data.idComponente == undefined)  return res.json({ msg: 'No se reconoce el ID del componente' })
        
        const componentes = await consultarComponentes(data.idActivo)
        if (componentes.map(element => { return element.id == data.idComponente }).indexOf(true) == -1) {
            return res.json({ msg: 'El Componente no pertenece al activo' })
        }
        const eliminar = await eliminarComponenteDb(data.idComponente)

        if (eliminar.msg) return res.json(eliminar)
        
        res.json('Componente Eliminado corectamnete')

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Elimina Componente ' + data.idComponente + ' del act ' + data.idActivo , ipAddress)

    } catch (error) {
        console.error(error)
        res.json({ msg: 'No fue posible eliminar el componente intentalo mas tarde si persiste el error comunicate con soporte' })
    }

}

const guardarComponente = async (req, res) => {
    try {
        const {sessionid, permisos } = req
        if (permisos.indexOf(3) === -1)  return res.json({ msg: 'Usted no tiene permisos para Actualizar Componente' })
        
        const data = req.body.data
           
        if (data == '' || data == null || data == undefined)  return res.json({ msg: 'Los datos no pueden enviarse vacios' })

        if (data.idActivo == '' || data.idActivo == null || data.idActivo == undefined) return res.json({ msg: 'No se reconoce el ID del activo' })
        
        const validacion = await validarDatosComponente(data.componente)

        if (validacion.msg) return res.json(validacion)

        const crear = await crearComponente(data.componente, data.idActivo)

        if(crear.msg) return res.json({msg: 'No fue posible asociar el componente al activo intentalo mas tarde'})

        res.json(crear)

        const ipAddress = req.connection.remoteAddress.split('f:')[1]
        actividadUsuario(sessionid, 'Crea Componente ' + crear.id + ' del act ' + crear.idactivo , ipAddress)

    } catch (error) {
        console.error(error)
        res.json({ msg: 'No fue posible crear el componente intentalo mas tarde si persiste el error comunicate con soporte' })
    }

}

export {
    eliminarComponente,
    guardarComponente,
}