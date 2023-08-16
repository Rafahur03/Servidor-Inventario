import { conectardb, cerrarConexion } from "./db.js";

const consultarSolicitudes = async (data) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT sm.id, CONCAT(TRIM(cl.siglas), la.consecutivo_interno) as codigoInterno,TRIM(la.nombre) AS nombreActivo, TRIM(la.modelo) AS modelo,
            TRIM(ma.marca) AS marca, sm.fecha_solicitud, TRIM(sm.solicitud) AS solicitud, TRIM(es.estado) AS estado FROM solicitudes_mtto sm
                INNER JOIN listado_activos la
                ON sm.id_activo = la.id
                INNER JOIN clasificacion_activos cl
                ON cl.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN estado_solicitudes es
                ON es.id = sm.id_estado
            WHERE sm.id_estado <> '4'
            ORDER BY sm.id_estado ASC, fecha_solicitud
        `)
        cerrarConexion(pool)
        return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}

const consultarSolicitudUno = async (id) => {

    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT sm.id, sm.id_activo, CONCAT(TRIM(cl.siglas), la.consecutivo_interno) as codigo, la.      nombre, TRIM(la.serie) AS serie,
                TRIM(la.modelo) AS modelo,TRIM(la.ubicacion) AS ubicacion, TRIM(ma.marca) AS marca,TRIM(es.estado) AS estado, TRIM(ta.tipo_activo) AS tipoActivo,
                CONCAT(TRIM(us.nombre),SPACE(1),TRIM(us.nombre_1),SPACE(1),TRIM(us.apellido),SPACE(1) ,TRIM(us.apellido_1)) AS usuario,
                sm.fecha_solicitud,sm.solicitud,TRIM(ess.estado) AS estadoSolicitud, TRIM(sm.img_solicitud) AS img_solicitud, TRIM(la.url_img) AS imagenes_Activo
                FROM solicitudes_mtto sm
                INNER JOIN listado_activos la
                ON sm.id_activo = la.id
                INNER JOIN clasificacion_activos cl
                ON cl.id = la.clasificacion_id
                INNER JOIN marca_activos ma
                ON ma.id = la.marca_id
                INNER JOIN estados es
                ON es.id = la.estado_id
                INNER JOIN estado_solicitudes ess
                ON ess.id = sm.id_estado
                INNER JOIN usuarios us
                ON us.id = sm.id_usuario
                INNER JOIN tipo_activo ta
                ON ta.id = la.tipo_activo_id
            WHERE sm.id = '${id}'
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el solicitud' }
    }
}

const guardarSolicitud = async (data) => {

    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            INSERT INTO solicitudes_mtto (id_activo, id_usuario, id_estado, fecha_solicitud, solicitud)
            VALUES('${data.id_activo}','${data.id_usuario}','${data.id_estado}','${data.fecha_solicitud}','${data.solicitud}')
            SELECT IDENT_CURRENT('solicitudes_mtto') AS id
        `)
        cerrarConexion(pool)
        return (resultado.recordset[0].id)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}
const actualizarImagenesSolicitud = async (data) => {

    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE solicitudes_mtto 
                SET img_solicitud='${data.img_solicitud}'
            WHERE id = '${data.id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}
const actualizarSolicitud = async (data) => {

    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE solicitudes_mtto 
                SET id_activo='${data.id_activo}', solicitud='${data.solicitud}', img_solicitud='${data.img_solicitud}'
            WHERE id = '${data.id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar el activo' }
    }
}

const eliminarSolicitudDb = async (id) => {

    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            UPDATE solicitudes_mtto 
                SET id_estado='4'
            WHERE id = '${id}'
        `)
        cerrarConexion(pool)
        return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return { msg: 'Ha ocurido un error al intentar eliminar la solicitud intente mas tarde' }
    }
}

export {
    consultarSolicitudes,
    guardarSolicitud,
    consultarSolicitudUno,
    actualizarSolicitud,
    eliminarSolicitudDb,
    actualizarImagenesSolicitud

}