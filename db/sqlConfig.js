import { conectardb, cerrarConexion } from "./db.js";

const consultaconfi = async (conf) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM ${conf}
        `)
        cerrarConexion(pool)
        return (resultado.recordsets[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos de configuracion' }
    }
}

const actualizarConfigDb = async (query) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}

const guardarConfig = async (query) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.recordset[0].id)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}

export {
    consultaconfi,
    actualizarConfigDb,
    guardarConfig
}