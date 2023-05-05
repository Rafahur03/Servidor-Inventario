import { conectardb, cerrarConexion } from "../db/db.js"
const probarfechas = async (req, res) => {
        const { fecha } =req.body
        const fechauu = new Date(fecha)
        console.log(fecha, fechauu)
    try {
        const pool = await conectardb()
        const resultado = await pool.query(
            `SELECT fechareporte, fechaCierre FROM repotesMtto WHERE ID= '914'`
        )
        cerrarConexion(pool)
        const data = resultado.recordset[0]
        const fechar = new Date(data.fechareporte)
        const fechac = new Date(data.fechaCierre)
        const hoy = new Date(Date.now())
        data.fechareporte.setMinutes(data.fechareporte.getMinutes() + data.fechareporte.getTimezoneOffset())
        fechac.setMinutes(fechac.getMinutes() + fechac.getTimezoneOffset())
        hoy.setMinutes(hoy.getMinutes() + hoy.getTimezoneOffset())
        data.fechareporte = data.fechareporte.toLocaleDateString('es-CO')
        const fechasFormateada = fechac.toLocaleString('es-CO')
        const hoyFormateada = hoy.toLocaleDateString('es-CO')
        console.log(hoyFormateada < fecha)

        // console.log(data.fechareporte.toString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }))
        // console.log(fechar.toString())
        res.json(resultado.recordset[0])
    } catch (error) {
        console.log(error)
    }

    
}

export {
    probarfechas
}