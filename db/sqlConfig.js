import conectardb from "./db.js";

const consultaconfi = async (conf) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM ${conf}
        `)
        return (resultado.recordsets[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar cargar los datos de configuracion'}
    }
}

const actualizarConfig = async (query) => {

    try {
        const pool = await conectardb()
        console.log(query)
        const resultado = await pool.query( query )
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde'}
    }
}

export{
    consultaconfi,
    actualizarConfig
}