import conectardb from "./db.js";

const consultarSolicitudes = async (data) => {
    
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT sm.id,sm.id_activo,CONCAT(TRIM(cl.siglas), la.consecutivo_interno) as codigo, la.nombre, sm.id_usuario, sm.fecha_solicitud, sm.solicitud, sm.id_estado  FROM solicitudes_mtto sm
            INNER JOIN listado_activos la
            ON sm.id_activo = la.id
            INNER JOIN clasificacion_activos cl
            ON cl.id = la.clasificacion_id
        `)
         return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar eliminar el activo'}
    }
}

const consultarSolicitudUno = async (id) => {
    
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
             SELECT sm.id, sm.id_activo, TRIM(cl.siglas) AS siglas, CONCAT(TRIM(cl.siglas), la.consecutivo_interno) as codigo, la.nombre, sm.id_usuario, sm.fecha_solicitud, sm.solicitud, sm.id_estado, sm.img_solicitud  FROM solicitudes_mtto sm
                INNER JOIN listado_activos la
                ON sm.id_activo = la.id
                INNER JOIN clasificacion_activos cl
                ON cl.id = la.clasificacion_id
            WHERE sm.id = '${id}'
        `)
         return (resultado.recordset[0])
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar eliminar el solicitud'}
    }
}

const guardarSolicitud = async (data) => {
    
    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            INSERT INTO solicitudes_mtto (id_activo, id_usuario, id_estado, fecha_solicitud, solicitud, img_solicitud)
            VALUES('${data.id_activo}','${data.id_usuario}','${data.id_estado}','${data.fecha_solicitud}','${data.solicitud}','${data.img_solicitud}')
            SELECT IDENT_CURRENT('solicitudes_mtto') AS id
        `)
         return (resultado.recordset[0].id)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar eliminar el activo'}
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
         return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar eliminar el activo'}
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
         return (resultado.rowsAffected)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar eliminar la solicitud intente mas tarde'}
    }
}

export{
    consultarSolicitudes,
    guardarSolicitud,
    consultarSolicitudUno,
    actualizarSolicitud,
    eliminarSolicitudDb

}