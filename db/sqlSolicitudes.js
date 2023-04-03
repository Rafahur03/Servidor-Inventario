import conectardb from "./db.js";

const consultarSolicitudes = async (data) => {
    
    try {
        const pool = await conectardb()
        const resultado = await pool.query(`
            SELECT sm.id,sm.id_activo,CONCAT(TRIM(cl.siglas), la.consecutivo_interno) as codigo, la.nombre, sm.id_usuario, sm.fecha_solicitud, sm.solicitud  FROM solicitudes_mtto sm
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

const guardarSolicitud = async (data) => {
    
    try {

        const pool = await conectardb()
        const resultado = await pool.query(`
            INSERT INTO solicitudes_mtto (id_activo, id_usuario, id_estado, fecha_solicitud, solicitud, img_solicitud)
            VALUES('${data.id_activo}','${data.id_usuario}','${data.id_estado}','${data.fecha_solicitud}','${data.solicitud}','${data.img_solicitud}')
        `)
         return (resultado.recordset)
    } catch (error) {
        console.error(error);
        return{msg:'Ha ocurido un error al intentar eliminar el activo'}
    }
}

export{
    consultarSolicitudes

}