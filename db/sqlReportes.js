import conectardb from "./db.js";

const consultarReportes = async () => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM repotesMtto
            ORDER BY id ASC
        `)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar guardar los datos intentalo mas tarde'}
    }
}

const consultarReporteUno = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM repotesMtto
            WHERE id ='${id}'
        `)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar consultar los dato'}
    }
}


export{consultarReportes,
    consultarReporteUno
}