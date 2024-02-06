

import { consultarListadoInsumosBodega, consultarInsumosBodega } from "../db/sqlInsumos.js"
const listadoInsumosBodega = async (req, res) => {
    console.log('en insumos')
    try {

        const { permisos } = req

        if (permisos.indexOf(3) === -1) return res.json({ msg: 'Usted no tiene permisos para este modulo' })

        const insumos = await consultarListadoInsumosBodega()
        res.json(insumos)

    } catch (err) {

        res.json({ msg: 'error al intentar consultar los datos de los insumos' })

    }

}


const consultarUnInsumo = async (req, res) => {
    try {

        const { permisos } = req

        if (permisos.indexOf(3) === -1) return res.json({ msg: 'Usted no tiene permisos para realizar esta operacion' })
        
        const id = req.body.id
        console.log(id)
        const insumo = await consultarInsumosBodega(id)
        insumo.fechaCompra = insumo.fechaCompra.toISOString().substring(0, 10)
        res.json({insumo:insumo})

    } catch (err) {

        res.json({ msg: 'error al intentar consultar los datos de los insumos' })

    }

}



export {
    listadoInsumosBodega,
    consultarUnInsumo
}