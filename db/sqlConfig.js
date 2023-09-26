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
            SELECT id, TRIM(tipoMtto) AS tipoMantenimeinto FROM tipo_mantenimeintos WHERE estado_id = 1 
            SELECT id, TRIM(nombre_comercial) AS nombre,TRIM(razon_social) AS razonSocial, TRIM(nit)  AS nit FROM proveedores WHERE estado = 1 
            SELECT id, CONCAT(TRIM(nombre), SPACE(1),TRIM(nombre_1), SPACE(1),TRIM(apellido), SPACE(1), TRIM(apellido_1)) AS usuario FROM usuarios WHERE Id_proveedores LIKE '%43%'  AND estado = 1 
        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar actualizar los datos intentalo mas tarde' }
    }
}

const consultarTodasTablas = async (query) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT ar.id, TRIM(ar.area) AS nombre, TRIM(es.estado) AS estado, CONCAT('Es-', ar.estado) AS estadoId FROM areas ar
            INNER JOIN estados es
            ON es.id = ar.estado
            SELECT ma.id, TRIM(ma.marca) AS nombre, TRIM(es.estado) AS estado, CONCAT('Es-', ma.estado) AS estadoId FROM marca_activos ma
            INNER JOIN estados es
            ON es.id = ma.estado
            SELECT ta.id, TRIM(ta. tipo_activo) AS nombre, TRIM(es.estado) AS estado, CONCAT('Es-', ta.estado) AS estadoId FROM tipo_activo ta
            INNER JOIN estados es
            ON es.id = ta.estado
            SELECT com.id, TRIM(com.componente) AS nombre, TRIM(es.estado) AS estado, CONCAT('Es-', com.estado) AS estadoId FROM lista_componentes com
            INNER JOIN estados es
            ON es.id = com.estado
            SELECT fre.id, TRIM(fre.frecuencia) AS nombre, fre.dias, TRIM(es.estado) AS estado, CONCAT('Es-', fre.estado) AS estadoId FROM frecuencia_Mtto fre
            INNER JOIN estados es
            ON es.id = fre.estado
            SELECT pro.id, TRIM(pro.proceso) AS nombre, TRIM(pro.sigla) AS sigla, TRIM(es.estado) AS estado,  CONCAT('Es-', pro.estado) AS estadoId FROM procesos pro
            INNER JOIN estados es
            ON es.id = pro.estado
            SELECT cla.id, TRIM(cla.nombre) AS nombre, TRIM(cla.siglas) AS sigla, TRIM(es.estado) AS estado, CONCAT('Es-', cla.estado) AS estadoId FROM clasificacion_activos cla
            INNER JOIN estados es
            ON es.id = cla.estado
            SELECT prov.id, CONCAT('Pro-', prov.id, '--', TRIM(prov.nombre_comercial), '--', TRIM(prov.razon_social), '--',	TRIM(prov.nit), '--', prov.dv, '--', TRIM(prov.contacto), '--', TRIM(prov.telefonos), '--', TRIM(prov.direccion), '--', TRIM(prov.descripcion), '--',TRIM(es.estado)) AS nombre,CONCAT('Es-', prov.estado) AS estadoId  FROM proveedores prov
            INNER JOIN estados es
            ON es.id = prov.estado
            SELECT id, TRIM(estado) AS estado FROM estados WHERE id <> 3
        `)
        cerrarConexion(pool)
        return (resultado.recordsets)
    } catch (error) {
        console.error(error);
        return { msg: 'No fue posible consultar las  tablas de configuraciones' }
    }
}

const consultarConfuno = async (query) => {
    try {
        const pool = await conectardb()
        const resultado = await pool.query(query)
        cerrarConexion(pool)
        return (resultado.recordset[0])

    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar cargar los datos de configuracion' }
    }

}


export {
    consultaconfi,
    actualizarConfigDb,
    guardarConfig,
    listaNuevoReporte,
    consultarTodasTablas,
    consultarConfuno
}