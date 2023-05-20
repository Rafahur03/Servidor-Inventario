﻿import { eliminarComponenteDb, consultarComponentes } from "../db/sqlComponentes.js"

const eliminarComponente = async (req, res) => {
    try {

        const { permisos } = req
        const arrPermisos = JSON.parse(permisos)
        if (arrPermisos.indexOf(3) === -1) {
            return res.json({ msg: 'Usted no tiene permisos para Actualizar Componente' })
        }

        const data = req.body.data

        if (data == '' || data == null || data == undefined) {
            return res.json({ msg: 'Debe seleccionar un componente valido para eliminar' })
        }

        if (data.idActivo == '' || data.idActivo == null || data.idActivo == undefined) {
            return res.json({ msg: 'No se reconoce el ID del activo' })
        }

        if (data.idComponente == '' || data.idComponente == null || data.idComponente == undefined) {
            return res.json({ msg: 'No se reconoce el ID del componente' })
        }
        const componentes = await consultarComponentes(data.idActivo)
        if (componentes.map(element => { return element.id == data.idComponente }).indexOf(true) == -1) {
            return res.json({ msg: 'El Componente no pertenece al activo' })
        }
        const eliminar = await eliminarComponenteDb(data.idComponente)

        res.json(eliminar)

    } catch (error) {
        console.error(error)
        res.json({ msg: 'No fue posible eliminar el componente intentalo mas tarde si persiste el error comunicate con soporte' })
    }

}


export {
    eliminarComponente
}