import { conectardb, cerrarConexion } from "./db.js";

const eliminarComponenteDb = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE componentes_activos 
                SET estado = 3
            WHERE id= ${id}
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el componente intentalo mas tarde.' }
    }
}

const consultarComponentes = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT ca.id, ca.componenteId, TRIM(lp.componente) AS nombre, ca.marca AS marcaId,
                TRIM(ma.marca) AS marca,TRIM(ca.modelo) AS modelo, TRIM(ca.serie) AS serie,TRIM(ca.capacidad) AS capacidad, ca.estado as estadoId
                FROM componentes_activos ca
                INNER JOIN lista_componentes lp
                ON lp.id = ca.componenteId
                INNER JOIN marca_activos ma
	            ON ma.id = ca.marca
            WHERE ca.idactivo = '${id}' AND  ca.estado = '1'
        `)
        cerrarConexion(pool)
        return (resultado.recordsets[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar consultar los componentes' }
    }
}

export {
    eliminarComponenteDb,
    consultarComponentes
}