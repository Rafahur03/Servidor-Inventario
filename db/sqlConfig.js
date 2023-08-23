import { conectardb, cerrarConexion } from "./db.js";

const consultaconfi = async (conf) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT * FROM ${conf}
            WHERE estado = 1
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

const listaNuevoReporte = async (query) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT id, TRIM(estado) AS estado FROM estados
            SELECT id, TRIM(estado) AS estado FROM estado_solicitudes
            SELECT id, TRIM(tipoMtto) AS tipoMantenimeinto FROM tipo_mantenimeintos WHERE estado_id <> 3
            SELECT id, TRIM(nombre_comercial) AS nombre,TRIM(razon_social) AS razonSocial, TRIM(nit)  AS nit FROM proveedores WHERE estado <> 3
            SELECT id, CONCAT(TRIM(nombre), SPACE(1),TRIM(nombre_1), SPACE(1),TRIM(apellido), SPACE(1), TRIM(apellido_1)) AS usuario FROM usuarios WHERE Id_proveedores LIKE '%43%'  AND estado <> 3
        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}



export {
    consultaconfi,
    actualizarConfigDb,
    guardarConfig,
    listaNuevoReporte
}