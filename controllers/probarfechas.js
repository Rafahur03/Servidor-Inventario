import { conectardb, cerrarConexion } from "../db/db.js"
const probarfechas = async (req, res) => {
    
    try {
        const pool = await conectardb()
        const resultado = await pool.query(
            `SELECT CONVERT(datetime, fechareporte,120) AS fechareporte FROM repotesMtto WHERE ID= '914'`
        )
        cerrarConexion(pool)
        const data = resultado.recordset[0]
        const fechar = new Date(data.fechareporte)
        console.log(data.fechareporte)
        console.log(data.fechareporte.toString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }))
        console.log(fechar.toString())
        res.json(resultado.recordset[0])
    } catch (error) {
        console.log(error)
    }

    
}

export {
    probarfechas
}